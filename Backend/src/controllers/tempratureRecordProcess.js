const TempratureProcessForm = require("../models/tempratureProcessForm");
const TempratureProcessRecord = require("../models/tempratureProcessRecords");
const { sequelize } = require("../config/db");
const User = require("../models/users");
const UserRole = require("../models/userRoles");
const { Op, ValidationError } = require("sequelize");
const bcrypt = require("bcrypt");
const { getElogDocsUrl } = require("../middlewares/authentication");
const TemperatureRecordAuditTrail = require("../models/temperatureRecordsAuditTrail");

// Fill tempratre record form and insert its records.
exports.InsertTempratureRecord = async (req, res) => {
  const {
    site_id,
    description,
    department,
    compression_area,
    limit,
    reviewer_id,
    approver_id,
    initiatorComment,
    email,
    password,
    FormRecordsArray,
    initiatorDeclaration,
  } = req.body;

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

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: true, message: "Please provide email and password." });
  }

  if (!initiatorComment) {
    return res
      .status(400)
      .json({ error: true, message: "Please provide an initiator comment." });
  }

  // Start a transaction
  const transaction = await sequelize.transaction();

  try {
    const user = await User.findOne({
      where: { user_id: req.user.userId },
      transaction,
    });

    if (!user) {
      await transaction.rollback();
      return res
        .status(401)
        .json({ error: true, message: "Invalid e-signature." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      await transaction.rollback();
      return res
        .status(401)
        .json({ error: true, message: "Invalid e-signature." });
    }

    let initiatorAttachment = null;
    const supportingDocs = {};

    // Process files
    req.files.forEach((file) => {
      if (file.fieldname === "initiatorAttachment") {
        initiatorAttachment = file;
      } else if (file.fieldname.startsWith("FormRecordsArray[")) {
        // Extract the index from the fieldname
        const match = file.fieldname.match(
          /FormRecordsArray\[(\d+)\]\[supporting_docs\]/
        );
        if (match) {
          const index = match[1];
          supportingDocs[index] = file;
        }
      }
    });

    // Create new temperature record Form
    const newForm = await TempratureProcessForm.create(
      {
        site_id: site_id,
        initiator_id: user.user_id,
        initiator_name: user.name,
        description: description,
        status: "INITIATION",
        stage: 1,
        department: department,
        compression_area: compression_area,
        limit: limit,
        reviewer_id: reviewer_id,
        approver_id: approver_id,
        initiatorAttachment: getElogDocsUrl(initiatorAttachment),
        initiatorComment: initiatorComment,
      },

      { transaction }
    );
    const getUserById = async (user_id) => {
      const user = await User.findOne({ where: { user_id } });
      return user;
    };

    const auditTrailEntries = [];
    const fields = {
      description,
      department,
      compression_area,
      limit,
      reviewer: (await getUserById(reviewer_id))?.name, 
      approver: (await getUserById(approver_id))?.name,
      initiatorComment,
    };
    for (const [field, value] of Object.entries(fields)) {
      if (value !== undefined && value !== null && value !== "") {
        auditTrailEntries.push({
          form_id: newForm.form_id,
          field_name: field,
          previous_value: null,
          new_value: value,
          changed_by: user.user_id,
          previous_status: "Not Applicable",
          new_status: "INITIATION",
          declaration: initiatorDeclaration,
        });
      }
    }

    if (initiatorAttachment) {
      auditTrailEntries.push({
        form_id: newForm.form_id,
        field_name: "initiatorAttachment",
        previous_value: null,
        new_value: getElogDocsUrl(initiatorAttachment),
        changed_by: user.user_id,
        previous_status: "Not Applicable",
        new_status: "INITIATION",
        declaration: initiatorDeclaration,
      });
    }

    if (Array.isArray(FormRecordsArray) && FormRecordsArray.length > 0) {
      const formRecords = FormRecordsArray.map((record, index) => ({
        form_id: newForm?.form_id,
        unique_id: record?.unique_id,
        time: record?.time, // Assuming time was meant here instead of unique_id again
        temprature_record: record?.temprature_record,
        remarks: record?.remarks,
        checked_by: record?.checked_by,
        supporting_docs: record?.supporting_docs
          ? record.supporting_docs
          : getElogDocsUrl(supportingDocs[index]),
      }));

      await TempratureProcessRecord.bulkCreate(formRecords, { transaction });
   formRecords.forEach((record, index) => {
        auditTrailEntries.push({
          form_id: newForm.form_id,
          field_name: `UniqueId[${index}]`,
          previous_value: null,
          new_value: record.unique_id,
          changed_by: user.user_id,
          previous_status: "Not Applicable",
          new_status: "INITIATION",
          declaration: initiatorDeclaration,
        });
        auditTrailEntries.push({
          form_id: newForm.form_id,
          field_name: `Time[${index}]`,
          previous_value: null,
          new_value: record.time,
          changed_by: user.user_id,
          previous_status: "Not Applicable",
          new_status: "INITIATION",
          declaration: initiatorDeclaration,
        });
        auditTrailEntries.push({
          form_id: newForm.form_id,
          field_name: `TemperatureRecord[${index}]`,
          previous_value: null,
          new_value: record.temprature_record,
          changed_by: user.user_id,
          previous_status: "Not Applicable",
          new_status: "INITIATION",
          declaration: initiatorDeclaration,
        });
        auditTrailEntries.push({
          form_id: newForm.form_id,
          field_name: `Remarks[${index}]`,
          previous_value: null,
          new_value: record.remarks,
          changed_by: user.user_id,
          previous_status: "Not Applicable",
          new_status: "INITIATION",
          declaration: initiatorDeclaration,
        });
        auditTrailEntries.push({
          form_id: newForm.form_id,
          field_name: `CheckedBy[${index}]`,
          previous_value: null,
          new_value: record.checked_by,
          changed_by: user.user_id,
          previous_status: "Not Applicable",
          new_status: "INITIATION",
          declaration: initiatorDeclaration,
        });
        if (supportingDocs[index]) {
          auditTrailEntries.push({
            form_id: newForm.form_id,
            field_name: `SupportingDocs[${index}]`,
            previous_value: null,
            new_value: getElogDocsUrl(supportingDocs[index]),
            changed_by: user.user_id,
            previous_status: "Not Applicable",
            new_status: "INITIATION",
            declaration: initiatorDeclaration,
          });
        }
      });
    }

    await TemperatureRecordAuditTrail.bulkCreate(auditTrailEntries, {
      transaction,
    });

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

// edit tempratre record elog details
exports.EditTempratureRecord = async (req, res) => {
  
  const {
    form_id,
    site_id,
    description,
    department,
    compression_area,
    limit,
    reviewer_id,
    approver_id,
    TempratureRecords,
    email,
    password,
    initiatorComment,
    initiatorDeclaration,
  } = req.body;

  // Check for required fields and provide specific error messages
  if (!form_id) {
    return res
      .status(400)
      .json({ error: true, message: "Please provide a form ID." });
  }
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: true, message: "Please provide email and password." });
  }

  const transaction = await sequelize.transaction();

  try {
    const user = await User.findOne({
      where: { user_id: req.user.userId },
      transaction,
    });

    if (!user) {
      await transaction.rollback();
      return res
        .status(401)
        .json({ error: true, message: "Invalid e-signature." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      await transaction.rollback();
      return res
        .status(401)
        .json({ error: true, message: "Invalid e-signature." });
    }

    let initiatorAttachment = null;
    const supportingDocs = {};

    req.files.forEach((file) => {
      if (file.fieldname === "initiatorAttachment") {
        initiatorAttachment = file;
      } else if (file.fieldname.startsWith("TempratureRecords[")) {
        // Extract the index from the fieldname
        const match = file.fieldname.match(
          /TempratureRecords\[(\d+)\]\[supporting_docs\]/
        );
        if (match) {
          const index = match[1];
          supportingDocs[index] = file;
        }
      }
    });

    // Find the form by ID
    const form = await TempratureProcessForm.findOne({
      where: { form_id: form_id },
      transaction,
    });

    if (!form) {
      await transaction.rollback();
      return res.status(404).json({ error: true, message: "Form not found." });
    }

    // Define epsilon for float comparison
    const EPSILON = 0.000001;

    // Function to compare floats with epsilon
    const areFloatsEqual = (a, b) => Math.abs(a - b) < EPSILON;

    // Track changes for the form
    const auditTrailEntries = [];
    const fields = {
      description,
      department,
      compression_area,
      limit,
      initiatorComment,
      initiatorAttachment: initiatorAttachment
        ? getElogDocsUrl(initiatorAttachment)
        : form.initiatorAttachment,
    };

    for (const [field, newValue] of Object.entries(fields)) {
      const oldValue = form[field];
      if (
        newValue !== undefined &&
        ((typeof newValue === "number" &&
          !areFloatsEqual(oldValue, newValue)) ||
          oldValue != newValue)
      ) {
        auditTrailEntries.push({
          form_id: form.form_id,
          field_name: field,
          previous_value: oldValue || null,
          new_value: newValue,
          changed_by: user.user_id,
          previous_status: form.status,
          new_status: "INITIATION",
          declaration: initiatorDeclaration,
        });
      }
    }

    // Update the form details
    await form.update(
      {
        site_id,
        description,
        department,
        compression_area,
        limit,
        reviewer_id,
        approver_id,
        initiatorAttachment: getElogDocsUrl(initiatorAttachment),
        initiatorComment,
      },
      { transaction }
    );

    // Update the Form Records if provided
    
    if (
      Array.isArray(TempratureRecords) &&
      TempratureRecords.length > 0
    ) {
      const existingRecords = await TempratureProcessRecord.findAll({
        where: { form_id: form_id },
        raw: true,
        // order: [["record_id", "DESC"]],
        transaction,
      });

      // Track changes for existing records
      existingRecords.forEach((existingRecord, index) => {
        TempratureRecords.sort(
          (a, b) => parseInt(a.record_id) - parseInt(b.record_id)
        );
        const newRecord = TempratureRecords[index];
        if (newRecord) {
          const recordFields = {
            temprature_record: newRecord.temprature_record,
            remarks: newRecord.remarks,
            supporting_docs:
              newRecord.supporting_docs ||
              getElogDocsUrl(supportingDocs[index]),
          };

          for (const [field, newValue] of Object.entries(recordFields)) {
            const oldValue = existingRecord[field];
            if (
              newValue !== undefined &&
              ((typeof newValue === "number" &&
                !areFloatsEqual(oldValue, newValue)) ||
                oldValue != newValue)
            ) {
              auditTrailEntries.push({
                form_id: form.form_id,
                field_name: `${field}[${index}]`,
                previous_value: oldValue || null,
                new_value: newValue,
                changed_by: user.user_id,
                previous_status: form.status,
                new_status: "INITIATION",
                declaration: initiatorDeclaration,
              });
            }
          }
        }
      });

      // Handle new records added
      if (TempratureRecords.length > existingRecords.length) {
        for (
          let i = existingRecords.length;
          i < TempratureRecords.length;
          i++
        ) {
          const newRecord = TempratureRecords[i];
          const recordFields = {
            unique_id: newRecord?.unique_id,
            time: newRecord?.time,
            checked_by: newRecord?.checked_by,
            temprature_record: newRecord.temprature_record,
            remarks: newRecord.remarks,
            supporting_docs:
              newRecord.supporting_docs || getElogDocsUrl(supportingDocs[i]),
          };

          for (const [field, newValue] of Object.entries(recordFields)) {
            if (newValue !== undefined) {
              auditTrailEntries.push({
                form_id: form.form_id,
                field_name: `${field}[${i}]`,
                previous_value: null,
                new_value: newValue,
                changed_by: user.user_id,
                previous_status: form.status,
                new_status: "INITIATION",
                declaration: initiatorDeclaration,
              });
            }
          }
        }
      }

      // Delete existing records for the form
      await TempratureProcessRecord.destroy({
        where: { form_id: form_id },
        transaction,
      });

      // Create new records
      const formRecords = TempratureRecords.map((record, index) => ({
        form_id: form_id,
        unique_id: record?.unique_id,
        time: record?.time,
        temprature_record: record?.temprature_record,
        remarks: record?.remarks,
        checked_by: record?.checked_by,
        supporting_docs: record?.supporting_docs
          ? record?.supporting_docs
          : getElogDocsUrl(supportingDocs[index]),
      }));

      await TempratureProcessRecord.bulkCreate(formRecords, { transaction });
    }

    await TemperatureRecordAuditTrail.bulkCreate(auditTrailEntries, {
      transaction,
    });

    await transaction.commit();

    return res.status(200).json({
      error: false,
      message: "E-log Updated successfully",
    });
  } catch (error) {
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

//get a tempratre record elog by id
exports.GetTempratureRecordElog = async (req, res) => {
  const form_id = req.params.id;

  if (!form_id) {
    return res
      .status(400)
      .json({ error: true, message: "Please provide a form ID." });
  }

  TempratureProcessForm.findOne({
    where: {
      form_id: form_id,
    },
    include: [
      {
        model: TempratureProcessRecord,
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

//get all the tempratre record elogs
exports.GetAllTempratureRecordElog = async (req, res) => {
  TempratureProcessForm.findAll({
    include: [
      {
        model: TempratureProcessRecord,
      },
      {
        model: User,
        as: "tpreviewer", // Use the consistent alias 'reviewer'
        attributes: ["user_id", "name"], // Specify which user attributes to fetch (optional)
      },
      {
        model: User,
        as: "tpapprover", // Use the consistent alias 'approver'
        attributes: ["user_id", "name"], // Specify which user attributes to fetch (optional)
      },
    ],
    order: [["form_id", "DESC"]],
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

//send tempratre record elog for review
exports.SendTRElogForReview = async (req, res) => {
  const { form_id, email, password, initiatorDeclaration } = req.body;

  // Check for required fields and provide specific error messages
  if (!form_id) {
    return res
      .status(400)
      .json({ error: true, message: "Please provide a form ID." });
  }
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: true, message: "Please provide email and password." });
  }

  // Start a transaction
  const transaction = await sequelize.transaction();

  try {
    // Verify user credentials
    const user = await User.findOne({
      where: { user_id: req.user.userId },
      transaction,
    });

    if (!user) {
      await transaction.rollback();
      return res
        .status(401)
        .json({ error: true, message: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      await transaction.rollback();
      return res
        .status(401)
        .json({ error: true, message: "Invalid email or password." });
    }

    // Find the form
    const form = await TempratureProcessForm.findOne({
      where: { form_id },
      transaction,
    });

    if (!form) {
      await transaction.rollback();
      return res.status(404).json({ error: true, message: "Elog not found." });
    }

    if (form.stage !== 1) {
      await transaction.rollback();
      return res.status(400).json({
        error: true,
        message: "Elog is not in a valid stage to be sent for review.",
      });
    }

    const auditTrailEntries = [
      {
        form_id: form.form_id,
        field_name: "stage Change",
        previous_value: "INITIATION",
        new_value: "UNDER REVIEW",
        changed_by: user.user_id,
        previous_status: "INITIATION",
        new_status: "UNDER REVIEW",
        declaration: initiatorDeclaration,
      },
    ];

    // Add audit trail entry for the attachment if it exists
    if (req?.file) {
      auditTrailEntries.push({
        form_id: form.form_id,
        field_name: "initiatorAttachment",
        previous_value: form.initiatorAttachment || null,
        new_value: getElogDocsUrl(req.file),
        changed_by: user.user_id,
        previous_status: "INITIATION",
        new_status: "UNDER REVIEW",
        declaration: initiatorDeclaration,
      });
    }

    // Update the form details
    await form.update(
      {
        status: "UNDER REVIEW",
        stage: 2,
        initiatorAttachment: req?.file
          ? getElogDocsUrl(req.file)
          : form.initiatorAttachment,
      },
      { transaction }
    );

    // Insert audit trail entries
    await TemperatureRecordAuditTrail.bulkCreate(auditTrailEntries, {
      transaction,
    });

    // Commit the transaction
    await transaction.commit();

    return res.status(200).json({
      error: false,
      message: "E-log successfully sent for review",
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await transaction.rollback();

    return res.status(500).json({
      error: true,
      message: `Error during sending E-log for review: ${error.message}`,
    });
  }
};

// change status of tempratre record elog from review to open
exports.SendTRElogfromReviewToOpen = async (req, res) => {
  const { form_id, email, password, reviewerDeclaration } = req.body;

  // Check for required fields and provide specific error messages
  if (!form_id) {
    return res
      .status(400)
      .json({ error: true, message: "Please provide a form ID." });
  }
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: true, message: "Please provide email and password." });
  }

  // Start a transaction
  const transaction = await sequelize.transaction();

  try {
    // Verify user credentials
    const user = await User.findOne({
      where: { user_id: req.user.userId, email },
      transaction,
    });

    if (!user) {
      await transaction.rollback();
      return res
        .status(401)
        .json({ error: true, message: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      await transaction.rollback();
      return res
        .status(401)
        .json({ error: true, message: "Invalid email or password." });
    }

    // Find the form
    const form = await TempratureProcessForm.findOne({
      where: { form_id },
      transaction,
    });

    if (!form) {
      await transaction.rollback();
      return res.status(404).json({ error: true, message: "Elog not found." });
    }

    if (form.stage !== 2) {
      await transaction.rollback();
      return res.status(400).json({
        error: true,
        message: "Elog is not in a valid stage.",
      });
    }

    const auditTrailEntries = [
      {
        form_id: form.form_id,
        field_name: "stage Change",
        previous_value: "UNDER REVIEW",
        new_value: "INITIATION",
        changed_by: user.user_id,
        previous_status: "UNDER REVIEW",
        new_status: "INITIATION",
        declaration: reviewerDeclaration,
      },
    ];

    // Add audit trail entry for the attachment if it exists
    if (req?.file) {
      auditTrailEntries.push({
        form_id: form.form_id,
        field_name: "reviewerAttachment",
        previous_value: form.reviewerAttachment || null,
        new_value: getElogDocsUrl(req.file),
        changed_by: user.user_id,
        previous_status: "UNDER REVIEW",
        new_status: "INITIATION",
        declaration: reviewerDeclaration,
      });
    }

    // Update the form details
    await form.update(
      {
        status: "INITIATION",
        stage: 1,
        reviewerAttachment: getElogDocsUrl(req?.file),
      },
      { transaction }
    );

    // Insert audit trail entries
    await TemperatureRecordAuditTrail.bulkCreate(auditTrailEntries, {
      transaction,
    });

    // Commit the transaction
    await transaction.commit();

    return res.status(200).json({
      error: false,
      message: "E-log status successfully updated to initiation",
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await transaction.rollback();

    return res.status(500).json({
      error: true,
      message: `Error during changing stage of elog: ${error.message}`,
    });
  }
};

// send tempratre record elog from review to approval
exports.SendTRfromReviewToApproval = async (req, res) => {
  const { form_id, reviewComment, email, password, reviewerDeclaration } =
    req.body;

  // Check for required fields and provide specific error messages
  if (!form_id) {
    return res
      .status(400)
      .json({ error: true, message: "Please provide a form ID." });
  }
  if (!reviewComment) {
    return res
      .status(400)
      .json({ error: true, message: "Please provide a review comment." });
  }
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: true, message: "Please provide email and password." });
  }

  // Start a transaction
  const transaction = await sequelize.transaction();

  try {
    // Verify user credentials
    const user = await User.findOne({
      where: { user_id: req.user.userId, email },
      transaction,
    });

    if (!user) {
      await transaction.rollback();
      return res
        .status(401)
        .json({ error: true, message: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      await transaction.rollback();
      return res
        .status(401)
        .json({ error: true, message: "Invalid email or password." });
    }

    // Find the form
    const form = await TempratureProcessForm.findOne({
      where: { form_id },
      transaction,
    });

    if (!form) {
      await transaction.rollback();
      return res.status(404).json({ error: true, message: "Elog not found." });
    }

    if (form.stage !== 2) {
      await transaction.rollback();
      return res.status(400).json({
        error: true,
        message: "Elog is not in a valid stage to be sent for approval.",
      });
    }

    const auditTrailEntries = [
      {
        form_id: form.form_id,
        field_name: "stage Change",
        previous_value: "UNDER REVIEW",
        new_value: "UNDER APPROVAL",
        changed_by: user.user_id,
        previous_status: "UNDER REVIEW",
        new_status: "UNDER APPROVAL",
        declaration: reviewerDeclaration,
      },
    ];

    if (reviewComment) {
      auditTrailEntries.push({
        form_id: form.form_id,
        field_name: "reviewComment",
        previous_value: form.reviewComment || null,
        new_value: reviewComment,
        changed_by: user.user_id,
        previous_status: "UNDER REVIEW",
        new_status: "UNDER APPROVAL",
        declaration: reviewerDeclaration,
      });
    }

    // Add audit trail entry for the attachment if it exists
    if (req?.file) {
      auditTrailEntries.push({
        form_id: form.form_id,
        field_name: "reviewerAttachment",
        previous_value: form.reviewerAttachment || null,
        new_value: getElogDocsUrl(req.file),
        changed_by: user.user_id,
        previous_status: "UNDER REVIEW",
        new_status: "UNDER APPROVAL",
        declaration: reviewerDeclaration,
      });
    }

    // Update the form details
    await form.update(
      {
        status: "UNDER APPROVAL",
        stage: 3,
        reviewComment: reviewComment,
        reviewerDeclaration: reviewerDeclaration,
        reviewerAttachment: getElogDocsUrl(req?.file),
        date_of_review: new Date(),
      },
      { transaction }
    );

    // Insert audit trail entries
    await TemperatureRecordAuditTrail.bulkCreate(auditTrailEntries, {
      transaction,
    });

    // Commit the transaction
    await transaction.commit();

    return res.status(200).json({
      error: false,
      message: "E-log status successfully updated to under-approval",
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await transaction.rollback();

    return res.status(500).json({
      error: true,
      message: `Error during sending E-log for approval: ${error.message}`,
    });
  }
};

// send tempratre record elog from under approval to open
exports.SendTRfromApprovalToOpen = async (req, res) => {
  const { form_id, email, password, approverDeclaration } = req.body;

  // Check for required fields and provide specific error messages
  if (!form_id) {
    return res
      .status(400)
      .json({ error: true, message: "Please provide a form ID." });
  }
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: true, message: "Please provide email and password." });
  }

  // Start a transaction
  const transaction = await sequelize.transaction();

  try {
    // Verify user credentials
    const user = await User.findOne({
      where: { user_id: req.user.userId, email },
      transaction,
    });

    if (!user) {
      await transaction.rollback();
      return res
        .status(401)
        .json({ error: true, message: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      await transaction.rollback();
      return res
        .status(401)
        .json({ error: true, message: "Invalid email or password." });
    }

    // Find the form
    const form = await TempratureProcessForm.findOne({
      where: { form_id },
      transaction,
    });

    if (!form) {
      await transaction.rollback();
      return res.status(404).json({ error: true, message: "Elog not found." });
    }

    if (form.stage !== 3) {
      await transaction.rollback();
      return res.status(400).json({
        error: true,
        message: "Elog is not in a valid stage.",
      });
    }

    const auditTrailEntries = [
      {
        form_id: form.form_id,
        field_name: "stage Change",
        previous_value: "UNDER APPROVAL",
        new_value: "INITIATION",
        changed_by: user.user_id,
        previous_status: "UNDER APPROVAL",
        new_status: "INITIATION",
        declaration: approverDeclaration,
      },
    ];

    // Add audit trail entry for the attachment if it exists
    if (req?.file) {
      auditTrailEntries.push({
        form_id: form.form_id,
        field_name: "approverAttachment",
        previous_value: form.approverAttachment || null,
        new_value: getElogDocsUrl(req.file),
        changed_by: user.user_id,
        previous_status: "UNDER APPROVAL",
        new_status: "INITIATION",
        declaration: approverDeclaration,
      });
    }

    // Update the form details
    await form.update(
      {
        status: "INITIATION",
        stage: 1,
        approverAttachment: getElogDocsUrl(req?.file),
      },
      { transaction }
    );

    // Insert audit trail entries
    await TemperatureRecordAuditTrail.bulkCreate(auditTrailEntries, {
      transaction,
    });

    // Commit the transaction
    await transaction.commit();

    return res.status(200).json({
      error: false,
      message: "E-log status successfully updated to initiation",
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await transaction.rollback();

    return res.status(500).json({
      error: true,
      message: `Error during changing stage of elog: ${error.message}`,
    });
  }
};

// APPROVE tempratre record elog
exports.ApproveTRElog = async (req, res) => {
  const { form_id, approverComment, email, password, approverDeclaration } =
    req.body;

  // Check for required fields and provide specific error messages
  if (!form_id) {
    return res
      .status(400)
      .json({ error: true, message: "Please provide a form ID." });
  }
  if (!approverComment) {
    return res
      .status(400)
      .json({ error: true, message: "Please provide an approver comment." });
  }
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: true, message: "Please provide email and password." });
  }

  // Start a transaction
  const transaction = await sequelize.transaction();

  try {
    // Verify user credentials
    const user = await User.findOne({
      where: { user_id: req.user.userId, email },
      transaction,
    });

    if (!user) {
      await transaction.rollback();
      return res
        .status(401)
        .json({ error: true, message: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      await transaction.rollback();
      return res
        .status(401)
        .json({ error: true, message: "Invalid email or password." });
    }

    // Find the form
    const form = await TempratureProcessForm.findOne({
      where: { form_id },
      transaction,
    });

    if (!form) {
      await transaction.rollback();
      return res.status(404).json({ error: true, message: "Elog not found." });
    }

    if (form.stage !== 3) {
      await transaction.rollback();
      return res.status(400).json({
        error: true,
        message: "Elog is not in a valid stage.",
      });
    }

    const auditTrailEntries = [
      {
        form_id: form.form_id,
        field_name: "stage Change",
        previous_value: "UNDER APPROVAL",
        new_value: "APPROVED",
        changed_by: user.user_id,
        previous_status: "UNDER APPROVAL",
        new_status: "APPROVED",
        declaration: approverDeclaration,
      },
    ];

    if (approverComment) {
      auditTrailEntries.push({
        form_id: form.form_id,
        field_name: "approverComment",
        previous_value: form.approverComment || null,
        new_value: approverComment,
        changed_by: user.user_id,
        previous_status: "UNDER APPROVAL",
        new_status: "APPROVED",
        declaration: approverDeclaration,
      });
    }

    // Add audit trail entry for the attachment if it exists
    if (req?.file) {
      auditTrailEntries.push({
        form_id: form.form_id,
        field_name: "approverAttachment",
        previous_value: form.approverAttachment || null,
        new_value: getElogDocsUrl(req.file),
        changed_by: user.user_id,
        previous_status: "UNDER APPROVAL",
        new_status: "APPROVED",
        declaration: approverDeclaration,
      });
    }

    // Update the form details
    await form.update(
      {
        status: "APPROVED",
        stage: 4,
        approverComment: approverComment,
        approverAttachment: req?.file
          ? getElogDocsUrl(req.file)
          : form.approverAttachment,
        date_of_approval: new Date(),
      },
      { transaction }
    );

    // Insert audit trail entries
    await TemperatureRecordAuditTrail.bulkCreate(auditTrailEntries, {
      transaction,
    });

    // Commit the transaction
    await transaction.commit();

    return res.status(200).json({
      error: false,
      message: "E-log successfully approved!!",
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await transaction.rollback();

    return res.status(500).json({
      error: true,
      message: `Error approving elog: ${error.message}`,
    });
  }
};

// get users based on roles, sites and processes
exports.GetUserOnBasisOfRoleGroup = async (req, res) => {
  const { role_id, site_id, process_id } = req.body;

  try {
    // Fetch users based on role, site, and process
    const selectedUsers = await UserRole.findAll({
      where: {
        [Op.or]: [
          { role_id: role_id, process_id: process_id, site_id: site_id },
          { role_id: 5, process_id: process_id, site_id: site_id },
        ],
      },
      include: {
        model: User,
      },
    });

    // Send the response with the fetched users
    return res.status(200).json({
      error: false,
      message: selectedUsers,
    });
  } catch (error) {
    // Catch any errors and send an appropriate response
    console.error("Error fetching users:", error);
    return res.status(500).json({
      error: true,
      message: `Error fetching users: ${error.message}`,
    });
  }
};



exports.getAuditTrailForAnElog = async (req, res) => {
  try {
    // Extract form_id from request parameters
    const formId = req.params.id;

    // Check if form_id is provided
    if (!formId) {
      return res
        .status(400)
        .json({ error: true, message: "Form ID is required." });
    }

    // Find all audit trail entries for the given form_id
    const auditTrail = await TemperatureRecordAuditTrail.findAll({
      where: { form_id: formId },
      include: {
        model: User,
        attributes: ["user_id", "name"],
      },
      order: [["auditTrail_id", "DESC"]],
    });

    if (!auditTrail || auditTrail.length === 0) {
      return res.status(404).json({
        error: true,
        message: "No audit trail found for the given form ID.",
      });
    }

    return res.status(200).json({ error: false, auditTrail });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: `Error retrieving audit trail: ${error.message}`,
    });
  }
};
