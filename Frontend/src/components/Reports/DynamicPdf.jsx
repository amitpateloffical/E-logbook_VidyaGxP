// import React, { useEffect, useState } from "react";
// import {
//   Document,
//   Page,
//   Text,
//   View,
//   StyleSheet,
//   Font,Image
// } from "@react-pdf/renderer";

// Font.register({
//   family: "Roboto",
//   src: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxP.ttf",
// });

// const styles = StyleSheet.create({
//   page: {
//     flexDirection: "column",
//     backgroundColor: "#ffffff",
//     // fontFamily: "Roboto",
//     fontSize: 12,
//     paddingTop: 30,
//     paddingBottom: 80,
//     paddingHorizontal: 30,
//   },
//   header: {
//     position: "fixed",
//     top: 0,
//     left: 0,
//     right: 0,
//     textAlign: "center",
//     flexDirection: "row",
//     height: 70,
//   },
//   head: {
//     width: "70%",
//    color:"black",
//    fontSize:"22px",
//     border:"1px solid black",
//     textAlign: "center",
//     // lineHeight: 70,
//   },
//   head1:{
//    marginTop:"20px"
//   },
//   headImg: {
//     width: "30%",
//     borderRight: "1px solid black",
//     borderBottom: "1px solid black",
//     borderTop:"1px solid black",
//   },
//   footer: {
//     position: "fixed",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     textAlign: "center",
//     backgroundColor: "#dddddd",
//     padding: 10,
//   },
//   section: {
//     marginBottom: 10,
//   },
//   content: {
//     // paddingTop: 60,
//     paddingBottom: 60,
//   },
//   fieldContainer: {
//     marginBottom: 5,

//   },
//   fieldName: {
//     fontWeight: "bold",
//     paddingBottom: "20px",
//   },

//   table: {
//     display: "table",
//     width: "auto",
//     borderStyle: "solid",
//     borderWidth: 1,
//     borderRightWidth: 0,
//     borderBottomWidth: 0,
//   },
//   tableRow: {
//     flexDirection: "row",
//   },
//   tableHeaderCol: {
//     width: "200px",
//     borderStyle: "solid",
//     backgroundColor: "#3383FF",
//     color: "white",
//     borderWidth: 1,
//     borderLeftWidth: 0,
//     borderTopWidth: 0,
//     padding: 8,
//     fontWeight: "bold",
//   },
//   tableCol: {
//     width: "200px",
//     borderStyle: "solid",
//     borderWidth: 1,
//     borderLeftWidth: 0,
//     borderTopWidth: 0,
//     padding: 8,
//   },
//   label: {
//     fontWeight: 800,
//     fontSize: "14px",
//     marginRight: 5,

//   },
//   general:{
//     fontSize:"20px",
//     fontWeight:700,
//     margin:"15px 0px 3px 0px"
//   },
//   info:{
//     borderBottom:"2px solid #1a75ff",
//     marginBottom:"20px"
//   }
// });

// const Footer = ({ footers }) => (
//   <View style={styles.footer}>
//     <Text>{footers}</Text>
//   </View>
// );

// const DynamicPdf = (  { elog } ) => {

//   return(

// <Document>
// <Page
//   size="A4"
//   style={styles.page}
//   render={({ pageNumber }) => (
//     <React.Fragment>
//       {pageNumber === 1 && (
//         <View style={styles.header}>
//           <View style={styles.head}><Text style={styles.head1}>{elog.process}</Text></View>
//           <View style={styles.headImg}>
//             <Image src="vidyalogo2.png" style={{ width: "100%", height: "100%" }} />
//           </View>
//         </View>
//       )}
//       <View>
//         <Text style={styles.general}>General Information</Text>
//         <Text style={styles.info}></Text>
//       </View>
//       <View style={styles.content}>
//         <View style={styles.fieldContainer}>
//           <Text style={styles.fieldName}>
//             <Text style={styles.label}>Initiator </Text>: {elog.initiator}
//           </Text>

//         </View>

//         <View style={styles.fieldContainer}>
//         <Text style={styles.fieldName}>
//             <Text style={styles.label}>Date Of Initiation </Text>:{" "}
//             {elog.dateOfInitiation}
//           </Text>
//         </View>

//         <View style={styles.fieldContainer}>
//           <Text style={styles.fieldName}>
//             <Text style={styles.label}>Short Description </Text>:{" "}
//             {elog.shortDescription}
//           </Text>
//         </View>

//         <View style={styles.fieldContainer}>
//           <Text style={styles.fieldName}>
//             <Text style={styles.label}>Description </Text>: {elog.description}
//           </Text>
//         </View>

//         <View style={styles.fieldContainer}>
//           <Text style={styles.fieldName}>
//             <Text style={styles.label}>Status </Text>: {elog.status}
//           </Text>
//         </View>

//         <View><Text style={styles.general}>Details</Text>
//     <Text style={styles.info}></Text>
//     </View>

//     <View style={styles.fieldContainer}>
//           <Text style={styles.fieldName}>
//             <Text style={styles.label}>Department </Text>: {elog.department}
//           </Text>
//         </View>

//     <View style={styles.fieldContainer}>
//           <Text style={styles.fieldName}>
//             <Text style={styles.label}>Compression Area</Text>: {elog.compressionArea}
//           </Text>
//         </View>

//     <View style={styles.fieldContainer}>
//           <Text style={styles.fieldName}>
//             <Text style={styles.label}>Diferential Pressure </Text>:
//             {elog.limit}
//           </Text>
//         </View>

//     <View style={styles.fieldContainer}>
//           <Text style={styles.fieldName}>
//             <Text style={styles.label}>Process </Text>: {elog.process}
//           </Text>
//         </View>

//         <View style={styles.section}>
//           <View style={styles.table}>
//             <View style={styles.tableRow}>
//             <View style={styles.tableHeaderCol}>
//                 <Text>S No</Text>
//               </View>
//               <View style={styles.tableHeaderCol}>
//                 <Text>Date</Text>
//               </View>
//               <View style={styles.tableHeaderCol}>
//                 <Text>Time</Text>
//               </View>
//               <View style={styles.tableHeaderCol}>
//                 <Text>Differential Pressure</Text>
//               </View>
//               <View style={styles.tableHeaderCol}>
//                 <Text>Remark</Text>
//               </View>
//               <View style={styles.tableHeaderCol}>
//                 <Text>Checked By</Text>
//               </View>
//             </View>
//             {elog.gridData?.map((row, rowIndex) => (
//               <View style={styles.tableRow} key={rowIndex}>
//                      <View style={styles.tableCol}>
//                   <Text>{rowIndex+1}</Text>
//                 </View>
//                 <View style={styles.tableCol}>
//                   <Text>{row.date}</Text>
//                 </View>
//                 <View style={styles.tableCol}>
//                   <Text>{row.time}</Text>
//                 </View>
//                 <View style={styles.tableCol}>
//                   <Text>{row.limit}</Text>
//                 </View>
//                 <View style={styles.tableCol}>
//                   <Text>{row.remark}</Text>
//                 </View>
//                 <View style={styles.tableCol}>
//                   <Text>{row.checkedBy}</Text>
//                 </View>
//               </View>
//             ))}
//           </View>
//         </View>
//       </View>
//       {pageNumber === 1 && (
//         <View style={styles.footer}>
//           <Text>Page - 1</Text>
//         </View>
//       )}
//     </React.Fragment>
//   )}
// />
// </Document>
// )};

// export default DynamicPdf;

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";

Font.register({
  family: "Roboto",
  src: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxP.ttf",
});

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    fontSize: 12,
    paddingTop: 30,
    paddingBottom: 80,
    paddingHorizontal: 30,
  },
  header: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    textAlign: "center",
    flexDirection: "row",
    height: 70,
  },
  head: {
    width: "70%",
    color: "black",
    fontSize: "22px",
    border: "1px solid black",
    textAlign: "center",
  },
  head1: {
    marginTop: "20px",
  },
  headImg: {
    width: "30%",
    borderRight: "1px solid black",
    borderBottom: "1px solid black",
    borderTop: "1px solid black",
  },
  footer: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    textAlign: "center",
    backgroundColor: "#dddddd",
    padding: 10,
  },
  section: {
    marginBottom: 10,
  },
  content: {
    // paddingTop: 60,
    paddingBottom: 60,
  },
  fieldContainer: {
    marginBottom: 5,
  },
  fieldName: {
    fontWeight: "bold",
    paddingBottom: "20px",
  },

  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeaderCol: {
    width: "200px",
    borderStyle: "solid",
    backgroundColor: "#32cfe1",
    color: "white",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
    fontWeight: "bold",
  },
  tableCol: {
    width: "200px",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
  },
  label: {
    fontWeight: 800,
    fontSize: "14px",
    marginRight: 5,
  },
  general: {
    fontSize: "20px",
    fontWeight: 700,
    margin: "15px 0px 3px 0px",
  },
  info: {
    borderBottom: "2px solid #1a75ff",
    marginBottom: "20px",
  },
});

const Header = ({ process }) => (
  <View style={styles.header}>
    <View style={styles.head}>
      <Text style={styles.head1}>{process}</Text>
    </View>
    <View style={styles.headImg}>
      <Image src="vidyalogo2.png" style={{ width: "100%", height: "100%" }} />
    </View>
  </View>
);

const Footer = () => (
  <View style={styles.footer}>
    <Text>Page - </Text>
  </View>
);

const DynamicPdf = ({ elog }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <Header process={elog.process} />
        <View>
          <Text style={styles.general}>General Information</Text>
          <Text style={styles.info}></Text>
        </View>
        <View style={styles.content}>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldName}>
              <Text style={styles.label}>Initiator </Text>: {elog.initiator}
            </Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldName}>
              <Text style={styles.label}>Date Of Initiation </Text>:{" "}
              {elog.dateOfInitiation}
            </Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldName}>
              <Text style={styles.label}>Short Description </Text>:{" "}
              {elog.shortDescription}
            </Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldName}>
              <Text style={styles.label}>Description </Text>: {elog.description}
            </Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldName}>
              <Text style={styles.label}>Status </Text>: {elog.status}
            </Text>
          </View>

          <View>
            <Text style={styles.general}>Details</Text>
            <Text style={styles.info}></Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldName}>
              <Text style={styles.label}>Department </Text>: {elog.department}
            </Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldName}>
              <Text style={styles.label}>Compression Area</Text>:{" "}
              {elog.compressionArea}
            </Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldName}>
              <Text style={styles.label}>Diferential Pressure </Text>:
              {elog.limit}
            </Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldName}>
              <Text style={styles.label}>Process </Text>: {elog.process}
            </Text>
          </View>
 
          <View style={styles.section}>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <View style={styles.tableHeaderCol}>
                  <Text>S No</Text>
                </View>
                <View style={styles.tableHeaderCol}>
                  <Text>Date</Text>
                </View>
                <View style={styles.tableHeaderCol}>
                  <Text>Time</Text>
                </View>
                <View style={styles.tableHeaderCol}>
                  <Text>Differential Pressure</Text>
                </View>
                <View style={styles.tableHeaderCol}>
                  <Text>Remark</Text>
                </View>
                <View style={styles.tableHeaderCol}>
                  <Text>Checked By</Text>
                </View>
              </View>
              {elog.gridData?.map((row, rowIndex) => (
                <View style={styles.tableRow} key={rowIndex}>
                  <View style={styles.tableCol}>
                    <Text>{rowIndex + 1}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text>{row.date}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text>{row.time}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text>{row.limit}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text>{row.remark}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text>{row.checkedBy}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
        <Footer />
      </Page>
    </Document>
  );
};

export default DynamicPdf;
