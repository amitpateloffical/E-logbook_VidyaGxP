const DifferentialPressureForm = require("../models/differentialPressureForm");
const DifferentialPressureRecord = require("../models/differentialPressureRecords");
const Process = require("../models/processes");
const { sequelize } = require("../config/db");
const User = require("../models/users");

// Fill Differential pressure form and insert its records.
exports.InsertDifferentialPressure = async (req, res) => {
  const {
    site_id,
    description,
    department,
    compression_area,
    limit,
    reviewer_id,
    approver_id,
    FormRecordsArray,
  } = req.body;

  // Check for required fields and provide specific error messages
  if (!site_id) {
    return res
      .status(400)
      .json({ error: true, message: "Please provide a site ID." });
  }
  if (!approver_id) {
    return res
      .status(400)
      .json({ error: true, message: "Please provide an approver." });
  }
  if (!reviewer_id) {
    return res
      .status(400)
      .json({ error: true, message: "Please provide a reviewer." });
  }

  // Start a transaction
  const transaction = await sequelize.transaction();

  try {
    const user = await User.findOne({
      where: {
        user_id: req.user.userId,
      },
    });

    // Create new Differential Pressure Form
    const newForm = await DifferentialPressureForm.create(
      {
        site_id: site_id,
        initiator_id: user.user_id,
        initiator_name: user.name,
        description: description,
        status: "initiation",
        stage: 1,
        department: department,
        compression_area: compression_area,
        limit: limit,
        reviewer_id: reviewer_id,
        approver_id: approver_id,
      },
      { transaction }
    );

    // Check if FormRecordsArray is provided
    if (Array.isArray(FormRecordsArray) && FormRecordsArray.length > 0) {
      const formRecords = FormRecordsArray.map((record) => ({
        form_id: newForm?.form_id,
        unique_id: record?.unique_id,
        time: record?.time, // Assuming time was meant here instead of unique_id again
        differential_pressure: record?.differential_pressure,
        remarks: record?.remarks,
        checked_by: record?.checked_by,
        supporting_docs: record?.supporting_docs,
      }));

      await DifferentialPressureRecord.bulkCreate(formRecords, { transaction });
    }

    // Commit the transaction
    await transaction.commit();

    return res.status(200).json({
      error: false,
      message: "E-log Created successfully",
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await transaction.rollback();

    let errorMessage = "Error during creating elog";
    if (error instanceof ValidationError) {
      errorMessage = error.errors.map((e) => e.message).join(", ");
    }

    return res.status(500).json({
      error: true,
      message: `${errorMessage}: ${error.message}`,
    });
  }
};

exports.EditDifferentialPressure = async (req, res) => {
  const {
    form_id,
    site_id,
    description,
    department,
    compression_area,
    limit,
    reviewer_id,
    approver_id,
    FormRecordsArray,
  } = req.body;

  // Check for required fields and provide specific error messages
  if (!form_id) {
    return res
      .status(400)
      .json({ error: true, message: "Please provide a form ID." });
  }
  if (!site_id) {
    return res
      .status(400)
      .json({ error: true, message: "Please provide a site ID." });
  }

  // Start a transaction
  const transaction = await sequelize.transaction();

  try {
    // Find the form by ID
    const form = await DifferentialPressureForm.findOne({
      where: { form_id: form_id },
    });

    if (!form) {
      await transaction.rollback();
      return res.status(404).json({ error: true, message: "Form not found." });
    }

    // Update the form details
    await form.update(
      {
        site_id: site_id,
        description: description,
        department: department,
        compression_area: compression_area,
        limit: limit,
        reviewer_id: reviewer_id,
        approver_id: approver_id,
      },
      { transaction }
    );

    // Update the Form Records if provided
    if (Array.isArray(FormRecordsArray) && FormRecordsArray.length > 0) {
      // First, delete existing records for the form
      await DifferentialPressureRecord.destroy({
        where: { form_id: form_id },
        transaction,
      });

      // Then, create new records
      const formRecords = FormRecordsArray.map((record) => ({
        form_id: form_id,
        unique_id: record?.unique_id,
        time: record?.time,
        differential_pressure: record?.differential_pressure,
        remarks: record?.remarks,
        checked_by: record?.checked_by,
        supporting_docs: record?.supporting_docs,
      }));

      await DifferentialPressureRecord.bulkCreate(formRecords, { transaction });
    }

    // Commit the transaction
    await transaction.commit();

    return res.status(200).json({
      error: false,
      message: "E-log Updated successfully",
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await transaction.rollback();

    let errorMessage = "Error during updating elog";
    if (error instanceof ValidationError) {
      errorMessage = error.errors.map((e) => e.message).join(", ");
    }

    return res.status(500).json({
      error: true,
      message: `${errorMessage}: ${error.message}`,
    });
  }
};

exports.GetDifferentialPressureElog = async (req, res) => {
  const form_id  = req.params.id;

  if (!form_id) {
    return res
      .status(400)
      .json({ error: true, message: "Please provide a form ID." });
  }

  DifferentialPressureForm.findOne({
    where: {
      form_id: form_id,
    },
    include: [
      {
        model: DifferentialPressureRecord,
      },
    ],
  })
    .then((result) => {
      res.json({
        error: false,
        message: result,
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: true,
        message: error.message,
      });
    });
};


exports.GetAllDifferentialPressureElog = async (req, res) => {

  DifferentialPressureForm.findAll({
    include: [
      {
        model: DifferentialPressureRecord,
      },
    ],
  })
    .then((result) => {
      res.json({
        error: false,
        message: result,
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: true,
        message: error.message,
      });
    });
};

exports.getAllProcesses = async (req, res) => {
  Process.findAll()
    .then((result) => {
      res.json({
        error: false,
        message: result,
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: true,
        message: "Couldn't find processes " + error,
      });
    });
};
