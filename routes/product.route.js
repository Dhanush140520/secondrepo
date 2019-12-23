const express = require('express');
const router = express.Router();
var sha1 = require('sha1');
var generator = require('generate-password');
const format = require('date-format');
const multer = require('multer');
const MulterAzureStorage = require('multer-azure-blob-storage').MulterAzureStorage;
var request = require('request');
var convertRupeesIntoWords = require('convert-rupees-into-words');
const knex = require('../knex/knex.js');
var DateDiff = require('date-diff');
var zeropad = require('zeropad');
var moment = require('moment');
var urlencode = require('urlencode');
var otpGenerator = require('otp-generator')
const nodemailer = require('nodemailer');
var implode = require('implode')
var defaultImg = 'admin.png';
// var macaddress = require('macaddress');
var now = new Date()
    // var blobName1 = Date.now() + "" + file.originalname;
    // const resolveBlobName = (req, file) => {
    //     return new Promise((resolve, reject) => {
    //         const blobName = yourCustomLogic;
    //         resolve(blobName);
    //     });
    // };

const azureStorage = new MulterAzureStorage({
    connectionString: 'DefaultEndpointsProtocol=https;AccountName=mindfinfiles;AccountKey=4NrEY0vfXnyvJVohjkXXcBLZDfYnCCUqO/HfnaTnhmiYAYxj0n9cbVRvheeNcvdEwJFnh4DhA1Uf7Uxbcq4ocw==;EndpointSuffix=core.windows.net',
    accessKey: '4NrEY0vfXnyvJVohjkXXcBLZDfYnCCUqO/HfnaTnhmiYAYxj0n9cbVRvheeNcvdEwJFnh4DhA1Uf7Uxbcq4ocw==',
    accountName: 'mindfinfiles',
    containerName: 'mindfin-backend',
    // blobName: originalname,
    // metadata: resolveMetadata,
    containerAccessLevel: 'blob',
    urlExpirationTime: 60,

    filename: function(req, file, cb) {
        cb(null, Date.now() + "" + file.originalname);
    }
});
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './src/assets/President/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + "" + file.originalname);
    }

})
const filename = (req, file, cb) => {
    cb(null, Date.now() + "" + file.originalname);
}
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf' || file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel' || file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 'application/octet-stream' || 'application/zip') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: azureStorage,
    limits: {
        fileSize: 150 * 1024 * 1024
    },
    fileFilter: fileFilter,
})

router.get('/piechart', function(req, res) {
    knex.select('usertype.user')
        .from('usertype')
        .count('employee.name as total')
        .join('employee', 'employee.iduser', 'usertype.idusertype')
        .where('employee.status', 'active')
        .groupBy('employee.iduser')
        .then(function(result) {
            res.json(result);
        })
})


// new apis to mindfin//
router.post('/bankinsert', (req, res) => {
    const nowdate1 = format.asString('yyyy-MM-dd', new Date());
    var date = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    var localTime = moment.utc(date).toDate();
    localTime = moment(localTime).format('YYYY-MM-DD HH:mm:ss');
    console.log("moment: " + localTime);
    if (req.body.idbank != null) {
        knex('bank')
            .where({ idbank: req.body.idbank })
            .update({
                bankname: req.body.bankname,
                bankvendor: req.body.bankvendor,
                updateddate: localTime
            })
            .then(function(result) {
                res.json('Bank Updated Successfully');
            })
    } else {
        knex('bank')
            .returning('id')
            .insert({
                bankname: req.body.bankname,
                status: "active",
                bankvendor: req.body.bankvendor,
                createddate: moment().format(nowdate1)
            })
            .then(function(result) {
                res.json('Bank Added Successfully');
            })
    }
})


router.get('/getbanklist', (req, res) => {
    knex.select()
        .from('bank')
        .where('bank.status', 'active')
        .then(function(result) {
            res.json(result);
        })
})

router.post('/getnames', (req, res) => {
    var vbs = req.body.length;
    for (var j = 0; j < req.body.length; j++) {
        var b1 = req.body[j].previousbankname;
        var l1 = req.body[j].previousapplytype;
        knex.select('bank.bankname')
            .from('bank')
            .where({ idbank: b1 })
            .then(function(result) {
                knex.select('loantype.loantype')
                    .from('loantype')
                    .where({ idloantype: l1 })
                    .then(function(re) {
                        res.json({
                            result: result,
                            re: re
                        })
                    })
            })
    }
})



router.post('/loaninsert', (req, res) => {
    const nowdate1 = format.asString('yyyy-MM-dd', new Date());
    if (req.body.idloantype != null) {
        knex('loantype')
            .where({ idloantype: req.body.idloantype })
            .update({
                loantype: req.body.loantype,
                code: req.body.code,
                updateddate: moment().format(nowdate1)
            })
            .then(function(result) {
                //console.log(result); 
                res.json('Loan Updated Successfully');
            })
    } else {
        knex('loantype')
            .returning('id')
            .insert({
                loantype: req.body.loantype,
                code: req.body.code,
                status: "active",
                createddate: moment().format(nowdate1)
            })
            .then(function(result) {
                //console.log(result); 
                res.json('Loan Added Successfully');
            })
    }
})


router.get('/getloanlist', (req, res) => {
    knex.select()
        .from('loantype')
        .where('loantype.status', 'active')

    .then(function(result) {
        //console.log(result); 
        res.json(result);
    })
})


router.post('/userinsert', (req, res) => {
    const nowdate1 = format.asString('yyyy-MM-dd', new Date());
    if (req.body.idusertype != null) {
        knex('usertype')
            .where({ idusertype: req.body.idusertype })
            .update({
                user: req.body.user,
                updateddate: moment().format(nowdate1)
            })
            .then(function(result) {
                res.json('Loan Updated Successfully');
            })
    } else {
        knex('usertype')
            .returning('id')
            .insert({
                user: req.body.user,
                status: "active",
                createddate: moment().format(nowdate1)
            })
            .then(function(result) {
                res.json('Loan Added Successfully');
            })
    }
})

router.get('/getuserlist', (req, res) => {
    knex.select()
        .from('usertype')
        .where('usertype.status', 'active')
        .then(function(result) {
            //console.log(result); 
            res.json(result);
        })
})


router.post('/employeetypeinsert', (req, res) => {
    console.log(req.body);
    var date3 = format.asString('yyyy-MM-dd', new Date());
    if (req.body.idemployeetype != null) {
        knex('employeetype')
            .where({ idemployeetype: req.body.idemployeetype })
            .update({
                emp_type: req.body.emp_type,
                updateddate: moment().format(date3)
            })
            .then(function(result) {
                res.json('Employeetype Updated Successfully');
            })
    } else {
        knex('employeetype')
            .insert({
                emp_type: req.body.emp_type,
                status: "active",
                createddate: moment().format(date3)
            })
            .then(function(result) {
                res.json('Employeetype Added Successfully');
            })
    }
})



router.get('/getemployeetypelist', (req, res) => {
    knex.select()
        .from('employeetype')
        .where('employeetype.status', 'active')
        .then(function(result) {
            //console.log(result); 
            res.json(result);
        })
})


router.post('/customeradd',
    upload.fields([{ name: 'cimage' }, { name: 'pimage' }, { name: 'aimage' }]), (req, res) => {
        var dob = req.body.dob;
        var applieddate = req.body.applieddate;
        // console.log(applieddate);
        const nowdate1 = format.asString('yyyy-MM-dd', new Date(dob));
        const nowdate = format.asString('yyyy-MM-dd', new Date(applieddate));
        let config = req.body.arr;
        let config1 = req.body.arr1;
        // console.log(config);
        if (req.files.cimage != null) {
            cimage = req.files.cimage[0]['filename'];
        } else {
            cimage = req.body.cimage;
        }

        if (req.files.pimage != null) {
            pimage = req.files.pimage[0]['filename'];
        } else {
            pimage = req.body.pimage;
        }

        if (req.files.aimage != null) {
            aimage = req.files.aimage[0]['filename'];
        } else {
            aimage = req.body.aimage;
        }
        knex('customer')
            .insert({
                name: req.body.name,
                mobile: req.body.mobile,
                email: req.body.email,
                cemail: req.body.cemail,
                dob: nowdate1,
                salary: req.body.salary,
                altmobile: req.body.altmobile,
                address: req.body.address,
                cname: req.body.cname,
                designation: req.body.designation,
                caddress: req.body.caddress,
                pincode: req.body.pincode,
                idexecutive: req.body.idexecutive,
                gender: req.body.gender,
                amount: req.body.amount,
                applytype: req.body.applytype,
                cimage: cimage,
                pimage: pimage,
                aimage: aimage,
                status: 'active',
                displaystatus: 'Pending',
                applieddate: nowdate,
                source: 'Application',
                documents: req.body.documents,
                idno: req.body.idno,
                subvendor: req.body.subvendor,
                topupstatus: 'topup',
                sourcetype: req.body.sourcetype,
                aadharno: req.body.aadharno,
                panno: req.body.panno,
                dlno: req.body.dlno,
                voterno: req.body.voterno,
                emptype: req.body.emptype,
                createdby: req.body.createdby


            }).returning('id')
            .then(function(id) {
                console.log(config);
                console.log(config1);
                const ids = id.toString();
                if (config1 == undefined || config1 == 'undefined') {
                    res.json("Not Inserted");
                    console.log("empty data")
                } else {
                    const vbs1 = JSON.parse(config1);
                    for (var j = 0; j < vbs1.length; j++) {
                        var coname = vbs1[j].coname
                        var copaddress = vbs1[j].copaddress
                        var coraddress = vbs1[j].coraddress

                        knex('co-customer')
                            .insert({
                                coappname: coname,
                                coappresaddress: copaddress,
                                coappperaddress: coraddress,
                                idcustomer: ids

                            }).then(function(re) {
                                res.json(re);
                            })
                    }
                }

            })
    });

router.get('/hotCustomers/:pagesize/:page', function(req, res) {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1))
    var date3 = format.asString('MM/dd/yyyy', new Date());
    var ddd = moment().format(date3);
    var d = new Date(ddd);
    var e = d.getDate();
    var m = d.getMonth() + 1;
    var y = d.getFullYear() + ',' + m + ',' + e;

    knex.select('customer.*')
        .from('customer')
        .where('customer.status', 'PENDING')
        .where('customer.source', 'Website')
        .orderBy('customer.applieddate', 'desc')
        .limit(pageSize).offset(skip)
        .then(function(result) {
            var a = result.length
            console.log(a);

            for (i = 0; i < a; i++) {
                var d1 = new Date(result[i].applieddate);
                var e1 = d1.getDate();
                var m1 = d1.getMonth() + 1;
                var y1 = d1.getFullYear() + ',' + m1 + ',' + e1;
                var date1 = new Date(y);
                var date4 = new Date(y1);
                var diff = new DateDiff(date1, date4);
                var opt = diff.days();
                console.log(opt);
                result[i].opt = opt;
            }
            knex.select()
                .from('customer')
                .where('customer.status', 'PENDING')
                .where('customer.source', 'Website')
                .orderBy('customer.applieddate', 'desc')
                .then(function(re) {
                    res.status(200).json({
                        message: "Memberlists fetched",
                        posts: result,
                        maxPosts: re.length
                    });
                })
        })
})


router.get('/customerlist/:pagesize/:page', function(req, res) {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1))
    var date3 = format.asString('MM/dd/yyyy', new Date());
    var ddd = moment().format(date3);
    var d = new Date(ddd);
    var e = d.getDate();
    var m = d.getMonth() + 1;
    var y = d.getFullYear() + ',' + m + ',' + e;

    knex.select('customer.*')
        .from('customer')
        .where('customer.status', 'APPROVED')
        .orderBy('customer.applieddate', 'desc')
        .limit(pageSize).offset(skip)
        .then(function(result) {
            var a = result.length
            console.log(a);

            for (i = 0; i < a; i++) {
                var d1 = new Date(result[i].applieddate);
                var e1 = d1.getDate();
                var m1 = d1.getMonth() + 1;
                var y1 = d1.getFullYear() + ',' + m1 + ',' + e1;
                var date1 = new Date(y);
                var date4 = new Date(y1);
                var diff = new DateDiff(date1, date4);
                var opt = diff.days();
                console.log(opt);
                result[i].opt = opt;
            }
            knex.select()
                .from('customer')
                .where('customer.status', 'APPROVED')
                .orderBy('customer.applieddate', 'desc')
                .then(function(re) {
                    res.status(200).json({
                        message: "Memberlists fetched",
                        posts: result,
                        maxPosts: re.length
                    });
                })
        })
})

router.get('/getexecutivelist', function(req, res) {
    knex.select()
        .from('employee')
        .join('usertype', 'usertype.idusertype', 'employee.iduser')
        .where('usertype.user ', 'EXECUTIVE')
        .where('employee.status ', 'active')
        .then(function(result) {
            //console.log(result);
            res.json(result);
        })
});

router.post('/approvecustomer', upload.fields([{ name: 'cimage' }, { name: 'pimage' }, { name: 'aimage' }]), (req, res) => {

    knex.select()
        .from('approvedcustomer')
        .then(function(re) {
            //console.log(re);
            var length = re.length;
            console.log(length);
            var len = length + 1;
            console.log(len);
            knex.select()
                .from('loantype')
                .where('loantype.idloantype ', req.body.applytype)
                .then(function(re) {
                    var code = re[0].code;

                    //console.log(req.body.applieddate);
                    var x = Buffer.from(req.body.applieddate);
                    var y = x.slice(2, 4);
                    //console.log(y.toString());

                    var abc = "MF" + code + y;
                    console.log(abc);
                    var autoid = abc + zeropad(len, 4)
                        // console.log(zeropad(len, 4));
                    console.log(autoid);

                    var password = generator.generate({
                        length: 8,
                        numbers: true
                    });

                    var dob = req.body.dob;
                    const nowdate = format.asString('yyyy-MM-dd', new Date(dob));
                    var nowdate1 = moment().format(nowdate)
                    const encryptedString = sha1(password);

                    knex('approvedcustomer')
                        .returning('id')
                        .insert({
                            autoid: autoid,
                            name: req.body.name,
                            mobile: req.body.mobile,
                            email: req.body.email,
                            dob: moment().format(nowdate1),
                            salary: req.body.salary,
                            altmobile: req.body.altmobile,
                            address: req.body.address,
                            cname: req.body.cname,
                            designation: req.body.designation,
                            caddress: req.body.caddress,
                            pincode: req.body.pincode,
                            idexecutive: req.body.idexecutive,
                            gender: req.body.gender,
                            amount: req.body.amount,
                            applytype: req.body.applytype,
                            cimage: req.body.cimage,
                            pimage: req.body.pimage,
                            aimage: req.body.aimage,
                            status: 'active',
                            password: encryptedString,
                            orgpassword: password,
                            source: req.body.source
                        })
                        .then(function(id) {
                            knex('customer')
                                .where({ idcustomer: req.body.idcustomer })
                                .update({
                                    idapprovecustomer: id,
                                    status: "inactive",
                                    displaystatus: "Approved"
                                }).then(function(result) {
                                    res.json('Approved customer Added Successfully');
                                })
                            knex('previousbankdetails')
                                .where({ idcustomer: req.body.idcustomer })
                                .update({
                                    idapprovedcustomer: id,
                                    status: "active"
                                }).then(function(result) {
                                    res.json('Approved customer Added Successfully');
                                })
                        })
                })
        })
})

router.post('/rejectcustomer', function(req, res) {
    var date3 = format.asString('yyyy-MM-dd', new Date());
    knex('customer')
        .where({ idcustomer: req.body.idcustomer })
        .update({
            status: "reject",
            displaystatus: "Reject",
            updateddate: moment().format(date3)
        }).then(function(result) {
            //console.log(result); 
            res.json('Approved custome Rejected Successfully');
        })
});

router.post('/deleteemp', function(req, res) {
    var date3 = format.asString('yyyy-MM-dd', new Date());
    knex('employee')
        .where({ idemployee: req.body.idemployee })
        .update({
            status: "inactive",
            updateddate: moment().format(date3)
        }).then(function(result) {
            //console.log(result); 
            res.json('Employee Deleted Successfully');
        })

})

// router.post('/employeeadd', (req, res) => {
//     console.log(req.body);
//     var password = generator.generate({
//         length: 8,
//         numbers: true
//     });
//     var dob = req.body.value.dob;
//     const nowdate1 = format.asString('yyyy-MM-dd', new Date(dob));
//     const nowdate = format.asString('yyyy-MM-dd', new Date());
//     const doj = req.body.value.joiningdate;
//     var cimage;
//     var pimage;
//     var aimage;
//     console.log(doj);
//     const nowdate2 = format.asString('yyyy-MM-dd', new Date(doj));
//     const encryptedString = sha1(password);
//     if (req.body.cimg == undefined) {
//         cimage = 'admin.png';

//     } else {
//         cimage = req.body.cimg[0].blobName;
//         console.log("BlobName  " + cimage);
//     }
//     if (req.body.pimg == undefined) {
//         pimage = 'admin.png';

//     } else {
//         pimage = req.body.pimg[0].blobName;
//         console.log(pimage);
//     }
//     if (req.body.aimg == undefined) {
//         aimage = 'admin.png';
//     } else {
//         aimage = req.body.aimg[0].blobName;
//         console.log(aimage);
//     }

//     knex('employee')
//         .returning('id')
//         .insert({
//             name: req.body.value.name,
//             mobile: req.body.value.mobile,
//             email: req.body.value.email,
//             dob: nowdate1,
//             ifsc: req.body.value.ifsc,
//             altmobile: req.body.value.altmobile,
//             address: req.body.value.address,
//             qualification: req.body.value.qualification,
//             accno: req.body.value.accno,
//             branch: req.body.value.branch,
//             pincode: req.body.value.pincode,
//             iduser: req.body.value.idusertype,
//             gender: req.body.value.gender,
//             cimage: cimage,
//             pimage: pimage,
//             aimage: aimage,
//             status: 'active',
//             password: encryptedString,
//             orgpassword: password,
//             joiningdate: nowdate2,
//             createddate: nowdate,
//             designation: req.body.value.designation,
//             createdby: req.body.createdby

//         })

//     .then(function(result) {

//         res.json('Employee Added Successfully');
//         knex.select()
//             .from('settings').where({ status: 'active' })
//             .then(function(resu) {
//                 console.log(resu);
//                 console.log(resu[0].idsetting);
//                 console.log(resu[0].emailuser);
//                 var emailuser = resu[0].emailuser;
//                 var emailpassword = resu[0].emailpassword;
//                 var hostmail = resu[0].hostmail;
//                 var resubject = resu[0].subject;
//                 var bsubject = resu[0].bsubject;

//                 var mloginlink = resu[0].mloginlink;
//                 var fromemail1 = resu[0].fromemail1;
//                 var regards = resu[0].regards;
//                 var cc = resu[0].cc;
//                 var bcc = resu[0].bcc;
//                 var address = resu[0].address;
//                 // res.json(resu);
//                 const output = `


//     <center style="width:100%;table-layout:fixed">
//     <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#F5F7F8">
//     <tbody><tr>
//     <td>

//     <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#F5F7F8">
//     <tbody><tr>
//     <td>    
//          <div style="margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:0px;padding-right:0px">
//   <table align="center" style="border-spacing:0;font-family:sans-serif;color:#f5f7f8;Margin:0 auto;width:100%" bgcolor="#F5F7F8">
//        <tbody><tr>
//   <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0" bgcolor="#F5F7F8">
//         <table width="100%" style="border-spacing:0;font-family:sans-serif;color:#f5f7f8" bgcolor="#F5F7F8">
//             <tbody><tr>
//                <td style="padding-bottom:0px;padding-top:0px;padding-left:20px;
//                padding-right:20px;background-color:#f5f7f8;color:#f5f7f8;width:100%;
//                font-size:1px;line-height:1px;text-align:left;display:none!important">


//             </td>
//             </tr>           
//         </tbody></table>
//     </td>
//   </tr>
//   </tbody></table>
//         </div>
//         </td>
//         </tr>
//         </tbody></table>


//                 <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#F5F7F8">
//     <tbody><tr>
//     <td style="padding-bottom:20px">
//          <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">

//   <table align="center"
//    style="border-spacing:0;font-family:sans-serif;color:#111111;Margin:0 auto;width:100%;max-width:600px" bgcolor="#F5F7F8">
//        <tbody><tr>
//   <td bgcolor="#F5F7F8" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
//         <table width="73%" style="border-spacing:0;font-family:sans-serif;color:#111111" bgcolor="#F5F7F8">
//             <tbody><tr>
//                  <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0px" 
//                   width="109" 
//                   height="103" 
//                   alt="logo"
//                    align="center">
//                    <img style="display:block; line-height:0px; font-size:0px; 
//                    border:0px;" src="https://dl2.pushbulletusercontent.com/CEyJvfyccHBYUunsWk8U99b6dkeV3s5Y/logo1.png" 
//                    width="150" height="100" alt="logo">
//    </td>
//             </tr>

//         </tbody></table>
//     </td>

//   </tr>
//   </tbody></table>

//         </div>
//         </td>
//         </tr>
//         </tbody></table>


//     <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
//     <tbody><tr>
//     <td bgcolor="#F5F7F8" style="background-color:#f5f7f8;padding-top:0;padding-right:0;padding-left:0;padding-bottom:0">
//     <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">
//       <table bgcolor="#FFFFFF" width="100%" align="center" border="0" cellspacing="0" cellpadding="0" style="font-family:sans-serif;color:#111111">
//         <tbody><tr>
//         <td bgcolor="#FFFFFF" align="center" style="word-break:break-all;padding-top:40px;padding-bottom:0;padding-right:40px;padding-left:40px;text-align:center;background-color:#ffffff;font-weight:bold;font-family:Arial,sans-serif,'Arial Bold','gdsherpa-bold';font-size:32px;line-height:42px" class="m_3203954183132274498h2mobile">

//           <span>
//           <a>Hi <b>` + req.body.name + `,</b><br/>
//           </a>
//           </span>

//         </td>
//         </tr>
//       </tbody></table>

//     </div>
//   </td>
//   </tr>
//   </tbody></table>

//   <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
//   <tbody><tr>
//   <td bgcolor="#F5F7F8" style="background-color:#f5f7f8;padding-top:0;padding-right:0;padding-left:0;padding-bottom:0">
//   <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">	
//   <table bgcolor="#FFFFFF" width="100%" align="center" border="0" cellspacing="0" cellpadding="0" style="font-family:sans-serif;color:#111111">
//   <tbody><tr>
//   <td bgcolor="#FFFFFF" align="center" style="padding-top:15px;padding-bottom:0;padding-right:40px;padding-left:40px;text-align:center;background-color:#ffffff;font-weight:bold;font-family:Arial,sans-serif,'Arial Bold','gdsherpa-bold';font-size:21px;line-height:31px">
//   <span><a>
//   Please note your CRM  credentials!!! .
//   </a></span>
//   </td>
//   </tr>
//   </tbody>
//   </table>
//   </div>
//   </td>
//   </tr>

//   </tbody></table>
//     <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
//        <tbody><tr>
//           <td bgcolor="#F5F7F8" style="padding-top:0px;padding-bottom:0px">
//              <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">

//                          <table bgcolor="#FFFFFF" align="center" style="border-spacing:0;font-family:sans-serif;color:#111111;margin:0 auto;width:100%;max-width:600px">
//                             <tbody><tr>
//                                <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
//                                   <table width="100%" style="border-spacing:0;font-family:sans-serif;color:#111111">
//                                      <tbody><tr>
//                                         <td style="padding-top:40px;padding-bottom:0px;padding-left:40px;padding-right:40px;background-color:#ffffff;width:100%;text-align:left">
//                                            <p style="margin-top:0px;line-height:0px;margin-bottom:0px;font-size:4px">&nbsp;</p>
//                                         </td>
//                                      </tr>
//                                   </tbody></table>
//                                </td>
//             </tr>
//              </tbody></table>     
//              </div>
//           </td>
//        </tr>
//     </tbody></table>
//     <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
//        <tbody><tr>
//           <td bgcolor="#F5F7F8" style="padding-top:0px;padding-bottom:0px">
//              <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">

//                          <table bgcolor="#1976D2" align="center" style="border-spacing:0;font-family:sans-serif;color:#ffffff;margin:0 auto;width:100%;max-width:600px">
//                             <tbody><tr>
//                                <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
//                                   <table width="100%" style="border-spacing:0;font-family:sans-serif;color:#ffffff">
//                                      <tbody><tr>
//                                         <td style="padding-top:25px;padding-bottom:0px;padding-left:40px;padding-right:40px;background-color:#1976d2;width:100%;text-align:center">
//                                            <p class="m_3203954183132274498bodycopy" 
//                                            style="font-family:Arial,sans-serif,'gdsherpa-regular';margin-top:0px;font-size:16px;line-height:26px;margin-bottom:0px">
//                                           YOUR PASSWORD:<b>` + password + `</b>,
//                                            <br/>EMAILID:<b style="font-family:Arial,sans-serif,'gdsherpa-regular';;color:#ffffff";margin-top:0px;font-size:16px;line-height:26px;margin-bottom:0px"> ` + req.body.email + `</b>
//                                           <br/>
//                                           </p>
//                                         </td>
//                                      </tr>
//                                   </tbody></table>
//                                </td>
//                             </tr>





//                                   <tr>
//           <td bgcolor="#F5F7F8" style="padding-top:0px;padding-bottom:0px">
//              <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:0px;padding-right:0px">

//                          <table bgcolor="#FFFFFF" align="center" style="border-spacing:0;font-family:sans-serif;color:#111111;margin:0 auto;width:100%;max-width:600px">
//                             <tbody><tr>
//                                <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0  ">
//                                   <table width="100%" style="border-spacing:0;font-family:sans-serif;color:#111111">
//                                      <tbody><tr>
//                                         <td style="padding-top:29px;font-size:23px;padding-bottom:0px;padding-left:40px;padding-right:40px;background-color:#ffffff;width:100%;text-align:center">


//                                         <p style="font-size: 16px;">
//                                       Click here to login <a href="` + mloginlink + `" style="color: blue">"` + mloginlink + `"</a><br/>
//                                        Login To Above Link <br/>To Start Your Process.....</p>





//                                         </td>
//                                      </tr>
//                                   </tbody></table>
//                                </td>
//                             </tr>
//                          </tbody></table>

//              </div>
//           </td>
//        </tr>



//                          </tbody></table>

//              </div>
//           </td>
//        </tr>
//     </tbody></table>

//   <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
//       <tbody>
//         </tbody></table>

//       </div>
//     </td>
//     </tr>
//   </tbody></table>

//     <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
//        <tbody>
//     </tbody></table>
//   <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
//     <tbody><tr>
//       <td bgcolor="#F5F7F8" style="padding-top:0px;padding-bottom:0px">
//         <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">

//           <table bgcolor="#FFFFFF" align="center" style="border-spacing:0;font-family:sans-serif;color:#111111;margin:0 auto;width:100%;max-width:600px">
//             <tbody><tr>
//               <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
//                 <table width="100%" style="border-spacing:0;font-family:sans-serif;color:#111111;table-layout:fixed">
//                   <tbody><tr>
//                     <td style="padding-top:15px;padding-bottom:0px;padding-left:40px;padding-right:40px;background-color:#ffffff;width:100%;text-align:left;word-break:break-all">
//                     <p style="font-size:16px;"><b>Regards</b></p>
//                     <p style="font-size: 16px;">` + regards + `</p>
//                     <p style="font-size: 16px;">` + address + `</p>
//                     <br>
//                     </td>
//                   </tr>
//                 </tbody></table>
//               </td>
//             </tr>
//           </tbody></table>

//         </div>
//       </td>
//     </tr>
//   </tbody></table>
//     <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
//       <tbody><tr>
//          <td bgcolor="#F5F7F8" style="padding-top:0px;padding-right:0;padding-left:0;padding-bottom:0px">
//             <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">

//                         <table bgcolor="#FFFFFF" width="100%" align="center" border="0" cellspacing="0" cellpadding="0" style="font-family:sans-serif;color:#ffffff">
//                           <tbody><tr>
//                              <td bgcolor="#FFFFFF" align="center" style="padding-top:20px;padding-bottom:0;padding-right:40px;padding-left:40px;text-align:center">
//                                 <table border="0" cellpadding="0" cellspacing="0" align="center" width="100%">
//                                   <tbody><tr>
//                                      <td align="center" style="padding-top:0;padding-right:0;padding-bottom:0;padding-left:0">
//                                         <table border="0" cellspacing="0" cellpadding="0" align="center">
//                                           <tbody><tr>
//                                              <td align="center" style="font-size:18px;line-height:22px;font-weight:bold;font-family:Arial,sans-serif,'Arial Bold','gdsherpa-bold'">
//                          <span>
//                          </span></td>
//                                           </tr>
//                                         </tbody></table>
//                                      </td>
//                                   </tr>
//                                 </tbody></table>
//                              </td>
//                           </tr>
//                         </tbody></table>

//             </div>
//          </td>
//       </tr>
//     </tbody></table>

//     <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
//        <tbody><tr>
//           <td bgcolor="#F5F7F8" style="padding-top:0px;padding-bottom:0px">
//              <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">

//                          <table bgcolor="#FFFFFF" align="center" style="border-spacing:0;font-family:sans-serif;color:#111111;margin:0 auto;width:100%;max-width:600px">
//                             <tbody><tr>
//                                <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
//                                   <table width="100%" style="border-spacing:0;font-family:sans-serif;color:#111111">
//                                      <tbody><tr>
//                                         <td style="padding-top:15px;padding-bottom:0px;padding-left:40px;padding-right:40px;background-color:#ffffff;width:100%;text-align:left">
//                                         </td>
//                                      </tr>
//                                   </tbody></table>
//                                </td>
//                             </tr>
//                          </tbody></table>

//              </div>
//           </td>
//        </tr>
//     </tbody></table>
//     <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
//        <tbody><tr>
//           <td bgcolor="#F5F7F8" style="padding-top:0px;padding-bottom:0px">
//              <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">

//                          <table bgcolor="#FFFFFF" align="center" style="border-spacing:0;font-family:sans-serif;color:#111111;margin:0 auto;width:100%;max-width:600px">
//                             <tbody><tr>
//                                <td width="20" bgcolor="#FFFFFF" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0"><img src="https://ci5.googleusercontent.com/proxy/RICSIZJJJakoeRjSl1leY13zGXyq9_HKIqrwFRrOPA57xyZdbs53L1rQ4yhCH11-SspdFH__fOZOY6Z2y9DifqeOMXwq3pGBzw-CBms=s0-d-e1-ft#https://imagesak.secureserver.net/promos/std/spc_trans.gif" height="10" width="20" border="0" style="display:block;border-width:0" class="CToWUd"></td>
//                                <td style="padding-top:25px;padding-bottom:0px;padding-right:0;padding-left:0;text-align:center;font-size:0;background-color:#ffffff">

//                                            <div style="width:100%;max-width:560px;display:inline-block;vertical-align:top">
//                                               <table width="100%" style="border-spacing:0;font-family:sans-serif;color:#111111">
//                                                  <tbody><tr>
//                                                     <td style="padding-top:0px;padding-bottom:0px;padding-left:20px;padding-right:20px;background-color:#ffffff">
//                                                        <table style="border-spacing:0;font-family:sans-serif;color:#111111;width:100%;font-size:14px;text-align:left;background-color:#ffffff;border-left-color:#fedc45;border-left-style:solid;border-left-width:3px">
//                                                           <tbody><tr>
//                                                              <td style="padding-top:0px;padding-bottom:0px;padding-left:20px;padding-right:20px;background-color:#ffffff;width:100%;text-align:left">
//                                                              </td>
//                                                           </tr>
//                                                        </tbody></table>
//                                                     </td>
//                                                  </tr>
//                                               </tbody></table>
//                                            </div>

//                                </td>
//                                <td width="20" bgcolor="#FFFFFF" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0"><img src="https://ci5.googleusercontent.com/proxy/RICSIZJJJakoeRjSl1leY13zGXyq9_HKIqrwFRrOPA57xyZdbs53L1rQ4yhCH11-SspdFH__fOZOY6Z2y9DifqeOMXwq3pGBzw-CBms=s0-d-e1-ft#https://imagesak.secureserver.net/promos/std/spc_trans.gif" height="10" width="20" border="0" style="display:block;border-width:0" class="CToWUd"></td>
//                             </tr>
//                          </tbody></table>

//              </div>
//           </td>
//        </tr>
//     </tbody></table>
//     <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
//        <tbody><tr>
//           <td bgcolor="#F5F7F8" style="padding-top:0px;padding-bottom:0px">
//              <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">

//                          <table bgcolor="#FFFFFF" align="center" style="border-spacing:0;font-family:sans-serif;color:#111111;margin:0 auto;width:100%;max-width:600px">
//                             <tbody><tr>
//                                <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
//                                   <table width="100%" style="border-spacing:0;font-family:sans-serif;color:#111111">
//                                      <tbody><tr>
//                                         <td style="padding-top:40px;padding-bottom:0px;padding-left:40px;padding-right:40px;background-color:#ffffff;width:100%;text-align:left">
//                                         </td>
//                                      </tr>
//                                   </tbody></table>
//                                </td>
//                             </tr>
//                          </tbody></table>

//              </div>
//           </td>
//        </tr>
//     </tbody></table>



























//                   <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
//   <tbody><tr>
//   <td bgcolor="#F5F7F8" style="padding-top:0px;padding-bottom:0px">
//       <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">

//   <table align="center" style="border-spacing:0;Margin:0 auto;width:100%;max-width:600px">
//    <tbody><tr>
//   <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
//       <table width="100%" style="border-spacing:0;font-family:sans-serif;color:#ffffff">
//               <tbody><tr>
//                   <td style="padding-top:40px;padding-bottom:0px;padding-left:40px;padding-right:40px;background-color:#f5f7f8;width:100%;text-align:left">
//                   </td>
//               </tr>
//           </tbody></table>
//       </td>
//   </tr>
//   </tbody></table>

//           </div>
//           </td>
//           </tr>
//           </tbody></table>


//                   <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#E8EAEB">
//   <tbody><tr>
//   <td bgcolor="#E8EAEB" style="padding-top:0px;padding-bottom:0px">
//       <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">

//   <table align="center" style="border-spacing:0;Margin:0 auto;width:100%;max-width:600px">
//    <tbody><tr>
//   <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
//       <table width="100%" style="border-spacing:0;font-family:sans-serif;color:#ffffff">
//               <tbody><tr>
//                   <td style="padding-top:40px;padding-bottom:0px;padding-left:40px;padding-right:40px;background-color:#e8eaeb;width:100%;text-align:left">
//                   </td>
//               </tr>
//           </tbody></table>
//       </td>
//   </tr>
//   </tbody></table>

//           </div>
//           </td>
//           </tr>
//           </tbody></table>


//                     <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#E8EAEB">
//        <tbody><tr>
//           <td bgcolor="#E8EAEB" style="padding-top:0px;padding-bottom:0px">
//              <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">

//                          <table align="center" style="border-spacing:0;font-family:sans-serif;color:#757575;margin:0 auto;width:100%;max-width:600px">
//                             <tbody><tr>
//                                <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
//                                   <table width="100%" style="border-spacing:0;font-family:sans-serif;color:#757575">
//                                      <tbody><tr>
//                                         <td style="padding-top:0px;padding-bottom:15px;padding-left:0px;padding-right:0px;background-color:#e8eaeb;width:100%;text-align:left">
//                                         </td>
//                                      </tr>
//                                   </tbody></table>
//                                </td>
//                             </tr>
//                          </tbody></table>

//              </div>
//           </td>
//        </tr>
//     </tbody></table>



//                   <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#E8EAEB">
//   <tbody><tr><td bgcolor="#E8EAEB" style="padding-top:0px;padding-bottom:0px">
//   <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">

//   <table align="center" style="border-spacing:0;font-family:sans-serif;color:#757575;Margin:0 auto;width:100%;max-width:600px">
//    <tbody><tr>
//   <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
//           <table width="100%" style="border-spacing:0;font-family:sans-serif;color:#757575">
//               <tbody><tr>
//                   <td style="padding-top:0px;padding-bottom:25px;padding-left:0px;padding-right:0px;background-color:#e8eaeb;width:100%;text-align:left">

//                             </td>
//               </tr>
//           </tbody></table>
//       </td>
//   </tr>
//   </tbody></table>

//           </div>
//           </td>
//           </tr>
//           </tbody></table>





//                   <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#E8EAEB">
//   <tbody><tr><td bgcolor="#E8EAEB" style="padding-top:0px;padding-bottom:0px">
//   <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">

//   <table align="center" style="border-spacing:0;font-family:sans-serif;color:#757575;Margin:0 auto;width:100%;max-width:600px">
//    <tbody><tr>
//   <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
//           <table width="100%" style="border-spacing:0;font-family:sans-serif;color:#757575">
//               <tbody><tr>
//                   <td style="padding-top:0px;padding-bottom:25px;padding-left:0px;padding-right:0px;background-color:#e8eaeb;width:100%;text-align:left">


//                   </td>
//               </tr>
//           </tbody></table>
//       </td>
//   </tr>
//   </tbody></table>

//           </div>
//           </td>
//           </tr>
//           </tbody></table>

//       </td>
//       </tr>
//       </tbody></table>
//       </center>



//      `;

//                 let transporter = nodemailer.createTransport({
//                     host: hostmail,
//                     port: 587,
//                     transportMethod: 'SMTP',
//                     // secure: false, // true for 465, false for other ports
//                     auth: {
//                         user: emailuser, // gmail id
//                         pass: emailpassword // gmail password
//                     },
//                     tls: {
//                         rejectUnauthorized: false
//                     }
//                 });
//                 // setup email data with unicode symbols
//                 let mailOptions = {
//                     from: fromemail1,
//                     to: req.body.email, // list of receivers
//                     cc: cc,
//                     bcc: bcc,
//                     subject: bsubject, //"Project Payment Update From", // Subject line
//                     text: 'Hello world?', // plain text body
//                     html: output // html body
//                 };
//                 // send mail with defined transport object
//                 transporter.sendMail(mailOptions, (error, info) => {
//                     if (error) {
//                         return console.log(error);
//                     }
//                     console.log('Message sent: %s', info.messageId);
//                     console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
//                     res.render('contact', { msg: 'Email has been sent' });
//                 });


//             })



//     })

// })




router.get('/getemployeelist/:pagesize/:page', function(req, res) {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1))
    knex.select()
        .from('employee')
        .join('usertype', 'usertype.idusertype', 'employee.iduser')
        .where('employee.status', 'active')
        .limit(pageSize).offset(skip)
        .then(function(result) {
            knex.select()
                .from('employee')
                .join('usertype', 'usertype.idusertype', 'employee.iduser')
                .where('employee.status', 'active')


            .then(function(re) {
                //console.log(re);
                //console.log(result);

                res.status(200).json({
                    message: "Memberlists fetched",
                    posts: result,
                    maxPosts: re.length
                });

            })
        })
})


router.get('/getexecutiveelist/:pagesize/:page', function(req, res) {
    console.log("hii");
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1))

    knex.select()
        .from('employee')
        .join('usertype', 'usertype.idusertype', 'employee.iduser')
        .where('usertype.user ', 'EXECUTIVE')
        .limit(pageSize).offset(skip)
        .then(function(result) {
            knex.select()
                .from('employee')
                .join('usertype', 'usertype.idusertype', 'employee.iduser')
                .where('usertype.user ', 'EXECUTIVE')
                .then(function(re) {
                    res.status(200).json({
                        message: "Memberlists fetched",
                        posts: result,
                        maxPosts: re.length

                    });
                })
        })

})

router.get('/viewcustomerid/:pagesize/:page/:id', (req, res, next) => {
    //console.log(req.params);
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1));
    // router.get('/viewcustomerid',function(req,res){
    //   //console.log(req.body);
    //   //console.log(req.params);
    knex.select()
        .from('customer', 'applybank')
        .join('applybank', 'applybank.idcustomer', 'customer.idcustomer')
        .where('customer.status', 'APPROVED')
        .where('applybank.executiveid', req.params.id)
        .limit(pageSize).offset(skip)
        .then(function(result) {
            knex.select()
                .from('customer', 'applybank')
                .join('applybank', 'applybank.idcustomer', 'customer.idcustomer')
                .where('customer.status', 'APPROVED')
                .where('applybank.executiveid', req.params.id)

            // .count({a:'customer.idcustomer'})
            .then(function(re) {
                //console.log(re);
                //console.log(result);
                res.status(200).json({
                    message: "Memberlists fetched",
                    posts: result,
                    maxPosts: re.length
                });
            })
        })
})

router.get('/approvedlist/:pagesize/:page', function(req, res) {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1))
    knex.select()
        .from('approvedcustomer')
        // .join('bank','bank.idbank','approvedcustomer.bankname')
        .join('loantype', 'loantype.idloantype', 'approvedcustomer.applytype')
        .where('approvedcustomer.status', 'active')
        .limit(pageSize).offset(skip)
        .then(function(result) {
            knex.select()
                .from('approvedcustomer')
                // .join('bank','bank.idbank','approvedcustomer.bankname')
                .join('loantype', 'loantype.idloantype', 'approvedcustomer.applytype')
                .where('approvedcustomer.status', 'active')
                .then(function(re) {
                    //console.log(re);
                    //console.log(result);
                    res.status(200).json({
                        message: "Approved list fetched",
                        posts: result,
                        maxPosts: re.length
                    });
                })
        })
})

// router.get('/approvedlist', (req, res, next) => {
//   ////console.log('');
//   const pageSize = +req.query.pagesize;
//   const currentPage = +req.query.page;
//   const postQuery = Approvedcustomer.find({memberstatus:'active'}).populate('bankname');
//   let fetchedPosts;
//   if (pageSize && currentPage) { 
//     postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
//   }
//   postQuery
//   .then(documents => {
//   fetchedPosts = documents;
//   return Approvedcustomer.find({memberstatus:'active'}).count();
//     })
//     .then(count => {
//       //console.log(fetchedPosts);
//       res.status(200).json({
//           // //console.log(fetchedPosts);
//         message: "Posts fetched successfully!",
//         posts: fetchedPosts,
//         maxPosts: count
//       });
//     });
// });


router.post('/adminlogin', (req, res) => {
    // let macAddresss;
    // macaddress.one(function(err, mac) {
    //     macAddresss = mac;
    //     //macAddress: macAddresss ,'employee.macAddress': macAddresss,




    // })
    username = req.body.username;
    const password = (sha1(req.body.password));
    knex.select()
        .from('employee')
        .join('usertype', 'usertype.idusertype', 'employee.iduser')
        .where({ 'employee.email': username, 'employee.password': password, 'employee.status': "active" })
        .then(function(result) {
            console.log(result);
            if (result == '' || result == null || result == undefined) {
                knex.select()
                    .from('customer')
                    .where({ email: username, password: password })
                    .then(function(re) {
                        console.log(re);
                        re.user = "CUSTOMER";
                        res.json(re);
                    })
            } else {
                res.json(result);
            }
        })
})




router.get('/employeecount', (req, res) => {
    knex.select()
        .from('employee')
        .where({ status: "active" })
        .count({ a: 'employee.idemployee' })
        .then(function(result) {
            //console.log(result); 
            res.json(result);
        })
})

router.get('/membercount', (req, res) => {
    knex.select()
        .from('approvedcustomer')
        .where({ status: "active" })
        .count({ a: 'approvedcustomer.idapprovedcustomer' })
        .then(function(result) {
            //console.log(result); 
            res.json(result);
        })
})

router.get('/rejectcount', (req, res) => {
    knex.select()
        .from('customer')
        .where({ status: "reject" })
        // .count({a:'customer.idcustomer'})
        .then(function(result) {
            //console.log(result); 
            res.json(result.length);
        })
})


router.get('/pendingcount', (req, res) => {
    knex.select()
        .from('customer')
        .where({ status: "active" })
        .count({ a: 'customer.idcustomer' })
        .then(function(result) {
            //console.log(result); 
            res.json(result);
        })
})


router.get('/editemp/:id', function(req, res) {
    knex.select()
        .from('employee')
        .join('usertype', 'usertype.idusertype', 'employee.iduser')
        .where('employee.idemployee', req.params.id)
        .then(function(result) {
            //console.log(result); 
            res.json(result);
        })
})



router.post('/editemployee', (req, res) => {
    console.log(req.body);
    const nowdate = format.asString('yyyy-MM-dd', new Date());
    var dob = req.body.value.dob;
    const nowdate1 = format.asString('yyyy-MM-dd', new Date(dob));
    const doj = req.body.value.joiningdate;
    const joiningdate = format.asString('yyyy-MM-dd', new Date(doj));
    var cimage;
    var pimage;
    var aimage;
    console.log(doj);

    if (req.body.cimg == undefined) {
        cimage = req.body.value.cimage;

    } else {
        cimage = req.body.cimg[0].blobName;
        console.log("BlobName  " + cimage);
    }
    if (req.body.pimg == undefined) {
        pimage = req.body.value.pimage;

    } else {
        pimage = req.body.pimg[0].blobName;
        console.log(pimage);
    }
    if (req.body.aimg == undefined) {
        aimage = req.body.value.aimage;
    } else {
        aimage = req.body.aimg[0].blobName;
        console.log(aimage);
    }
    knex('employee')
        .where({ idemployee: req.body.idemployeee })
        .update({
            name: req.body.value.name,
            mobile: req.body.value.mobile,
            email: req.body.value.email,
            dob: nowdate1,
            ifsc: req.body.value.ifsc,
            altmobile: req.body.value.altmobile,
            address: req.body.value.address,
            qualification: req.body.value.qualification,
            accno: req.body.value.accno,
            branch: req.body.value.branch,
            pincode: req.body.value.pincode,
            iduser: req.body.value.idusertype,
            gender: req.body.value.gender,
            cimage: cimage,
            pimage: pimage,
            aimage: aimage,
            status: 'active',
            joiningdate: joiningdate,
            updateddate: nowdate,
            empno: req.body.value.empno,
            designation: req.body.value.designation,
            createdby: req.body.createdby
        })
        .then(function(result) {
            //console.log(result); 
            res.json('Employee Updated Successfully');
        })
})

router.get('/memberviewdetails/:memberid', function(req, res) {

    //console.log(req.params);
    Approvedcustomer.findOne({ _id: req.params.memberid }).populate('idexecutive applytype ').exec(function(err, result) {
        res.json(result);
    })
})



router.get('/editcust/:id', function(req, res) {
    knex.select()
        .from('customer')

    .where('customer.idcustomer', req.params.id)
        .then(function(result) {
            //console.log(result); 
            res.json(result);
        })
})

router.get('/getextradetails/:id', function(req, res) {
    knex.select('previousbankdetails.amount as previousamounttaken', 'bank.bankname as previousbankname', 'loantype.loantype as previousapplytype')
        .from('previousbankdetails')
        .join('bank', 'bank.idbank', 'previousbankdetails.idbank')
        .join('loantype', 'loantype.idloantype', 'previousbankdetails.idloantype')
        .where('previousbankdetails.idcustomer', req.params.id)
        .then(function(result) {
            //console.log(result); 
            res.json(result);
        })
})


router.post('/customerupdate', (req, res) => {
    console.log(req.body);
    console.log("id", req.body.id);
    var dob = req.body.value.dob;
    var applieddate = req.body.value.applieddate;
    // console.log(applieddate);
    const nowdate1 = format.asString('yyyy-MM-dd', new Date(dob));
    const nowdate = format.asString('yyyy-MM-dd', new Date(applieddate));
    const nowdate2 = format.asString('yyyy-MM-dd', new Date());
    let config = req.body.arr;
    knex('customer')
        .where("idcustomer", req.body.id)
        .update({
            name: req.body.value.name,
            mobile: req.body.value.mobile,
            email: req.body.value.email,
            cemail: req.body.cemail,
            dob: nowdate1,
            salary: req.body.value.salary,
            altmobile: req.body.value.altmobile,
            address: req.body.value.address,
            cname: req.body.value.cname,
            designation: req.body.value.designation,
            caddress: req.body.value.caddress,
            pincode: req.body.value.pincode,
            idexecutive: req.body.value.idexecutive,
            gender: req.body.value.gender,
            amount: req.body.value.amount,
            applytype: req.body.value.applytype,
            applieddate: nowdate,
            source: 'Application',
            subvendor: req.body.value.subvendor,
            topupstatus: 'topup',
            sourcetype: req.body.value.sourcetype,
            aadharno: req.body.value.aadharno,
            panno: req.body.value.panno,
            dlno: req.body.value.dlno,
            voterno: req.body.value.voterno,
            emptype: req.body.value.emptype,
            editby: req.body.value.createdby,
            editorname: req.body.value.empname,
            updateddate: nowdate2,
        })

    .then(function() {

        console.log("conf", config);

        if (config == undefined || config == 'undefined') {
            res.json("Not Inserted");
            console.log("empty data")
        } else {
            // const vbs1 = JSON.parse(config);
            for (var j = 0; j < config.length; j++) {
                var coname = config[j].coname
                var copaddress = config[j].copaddress
                var coraddress = config[j].coraddress

                knex('co-customer')
                    .insert({
                        coappname: coname,
                        coappresaddress: copaddress,
                        coappperaddress: coraddress,
                        idcustomer: req.body.id

                    }).then(function(re) {
                        res.json(re);
                    })
            }
        }

    })
})

// router.post('/customerupdate', upload.fields([{ name: 'cimage' }, { name: 'pimage' }, { name: 'aimage' }]), (req, res) => {
//     var dob = req.body.dob;
//     var applieddate = req.body.applieddate;
//     // console.log(applieddate);
//     const nowdate1 = format.asString('yyyy-MM-dd', new Date(dob));
//     const nowdate = format.asString('yyyy-MM-dd', new Date(applieddate));
//     const nowdate2 = format.asString('yyyy-MM-dd', new Date());
//     // let config = req.body.arr;
//     let config1 = req.body.arr1;
//     // console.log(config);
//     if (req.files.cimage != null) {
//         cimage = req.files.cimage[0]['filename'];
//     }
//     else {
//         cimage = req.body.cimage;
//     }

//     if (req.files.pimage != null) {
//         pimage = req.files.pimage[0]['filename'];
//     }
//     else {
//         pimage = req.body.pimage;
//     }

//     if (req.files.aimage != null) {
//         aimage = req.files.aimage[0]['filename'];
//     }
//     else {
//         aimage = req.body.aimage;
//     }
//     knex('customer')
//         .where("idcustomer", req.body.id)
//         .update({
//             name: req.body.name,
//             mobile: req.body.mobile,
//             email: req.body.email,
//             cemail: req.body.cemail,
//             dob: nowdate1,
//             salary: req.body.salary,
//             altmobile: req.body.altmobile,
//             address: req.body.address,
//             cname: req.body.cname,
//             designation: req.body.designation,
//             caddress: req.body.caddress,
//             pincode: req.body.pincode,
//             idexecutive: req.body.idexecutive,
//             gender: req.body.gender,
//             amount: req.body.amount,
//             applytype: req.body.applytype,
//             cimage: cimage,
//             pimage: pimage,
//             aimage: aimage,
//             // status: 'active',
//             // displaystatus: 'Pending',
//             applieddate: nowdate,
//             source: 'Application',
//             // documents: req.body.documents,
//             // idno: req.body.idno,
//             subvendor: req.body.subvendor,
//             topupstatus: 'topup',
//             sourcetype: req.body.sourcetype,
//             aadharno: req.body.aadharno,
//             panno: req.body.panno,
//             dlno: req.body.dlno,
//             voterno: req.body.voterno,
//             emptype: req.body.emptype,
//             editby: req.body.createdby,
//             editorname: req.body.empname,
//             updateddate: nowdate2,


//         })
//         // .returning('id')
//         .then(function () {
//             // console.log(config);
//             console.log(config1);
//             // const ids = id.toString();
//             if (config1 == undefined || config1 == 'undefined') {
//                 res.json("Not Inserted");
//                 console.log("empty data")
//             }
//             else {
//                 const vbs1 = JSON.parse(config1);
//                 for (var j = 0; j < vbs1.length; j++) {
//                     var coname = vbs1[j].coname
//                     var copaddress = vbs1[j].copaddress
//                     var coraddress = vbs1[j].coraddress

//                     knex('co-customer')
//                         .insert({
//                             coappname: coname,
//                             coappresaddress: copaddress,
//                             coappperaddress: coraddress,
//                             idcustomer: req.body.id

//                         }).then(function (re) {
//                             res.json(re);
//                         })
//                 }
//             }

//         })
// });


router.get('/getaging/:date', function(req, res) {
    var date3 = format.asString('MM/dd/yyyy', new Date());

    var d = new Date(date3);
    var e = d.getDate();
    var m = d.getMonth() + 1;
    var y = d.getFullYear() + ',' + m + ',' + e;


    var d1 = new Date(req.params.date);
    var e1 = d1.getDate();
    var m1 = d1.getMonth() + 1;
    var y1 = d1.getFullYear() + ',' + m1 + ',' + e1;

    var date1 = new Date(y);
    var date4 = new Date(y1);
    var diff = new DateDiff(date1, date4);

    res.json(diff.days());

});

router.post('/applybank', (req, res, next) => {
    const id = req.body.bname;
    var id1 = id.substr(2);
    arr = [id1];
    //console.log(arr);
    var str = arr.toString();
    var output = str.split(',');
    //console.log(output.length);
    for (i = 0; i < output.length; i++) {
        //console.log(req.body.idvalue);
        //console.log(output[i]);
        knex('applybank')
            .insert({
                idbank: output[i],
                idcustomer: req.body.idvalue
            })
            .then(function(result) {
                //console.log(result); 
                res.json('ApplyBank Added Successfully');
            })
    }

})

router.get('/homememberlist/:memberid', function(req, res) {
    //console.log(req.params.memberid);
    knex.select()
        .from('employee')
        .join('usertype', 'usertype.idusertype', 'employee.iduser')
        .where({ idemployee: req.params.memberid })
        .then(function(result) {
            //console.log(result);
            res.json(result);
        });
});


router.post('/memberlogin', (req, res, next) => {
    var username = req.body.mid;
    var password = req.body.password;
    const pwd = (sha1(password));
    knex.select()
        .from('customer')
        .where({ email: username, password: pwd })
        .then(function(result) {
            res.json(result);
        })
})


router.post('/businesslistinsert', (req, res) => {
    if (req.body.idlistforbusiness != null) {

        knex('listforbusiness')
            .where({ idlistforbusiness: req.body.idlistforbusiness })
            .update({
                list: req.body.list
            })
            .then(function(result) {
                res.json('Business List Updated Successfully');
            })

    } else {
        knex('listforbusiness')
            .insert({
                list: req.body.list,
                status: "active"
            })
            .then(function(result) {
                //console.log(result); 
                res.json('Bank Added Successfully');
            })
    }
})


router.get('/getbusinesslist', (req, res) => {
    knex.select()
        .from('listforbusiness')
        .where('listforbusiness.status', 'active')
        .then(function(result) {

            res.json(result);
        })
})

router.get('/getviewbanklist/:id', (req, res) => {
    // console.log(req.params);
    knex.select('applybank.*', 'bank.bankname', 'loantype.loantype')
        .from('applybank')
        .join('customer', 'customer.idcustomer', 'applybank.idcustomer')
        .join('bank', 'bank.idbank', 'applybank.idbank')
        .join('loantype', 'loantype.idloantype', 'applybank.idloan')
        .where('applybank.idcustomer', req.params.id)
        .where('applybank.status', 'PENDING')

    .then(function(result) {

        res.json(result);
    })
})



router.get('/getViewPrevBankList/:id', (req, res) => {
    // console.log(req.params);
    knex.select('previousbankdetails.*', 'bank.bankname', 'loantype.loantype')
        .from('previousbankdetails')
        .join('customer', 'customer.idcustomer', 'previousbankdetails.idcustomer')
        .join('bank', 'bank.idbank', 'previousbankdetails.idbank')
        .join('loantype', 'loantype.idloantype', 'previousbankdetails.idloantype')
        .where('previousbankdetails.idcustomer', req.params.id)
        .then(function(result) {

            res.json(result);
        })
})


router.post('/addenquiry', (req, res) => {
    console.log(req.body);
    // var applieddate = req.body.value.enqdate;
    // console.log(applieddate);
    // const localTime = format.asString('yyyy-MM-dd', new Date());
    var abc = req.body.value.executive.split(",", 2);
    console.log(abc);
    var localTime = format.asString('yyyy-MM-dd', new Date());
    knex('enquirydata')
        .insert({
            name: req.body.value.name,
            email: req.body.value.email,
            mobile: req.body.value.mobile,
            altmobile: req.body.value.altmobile,
            address: req.body.value.address,
            status: req.body.value.status,
            gender: req.body.value.gender,
            loantype: req.body.value.applytype,
            createddate: localTime,
            teleid: req.body.teleid,
            adminid: abc[0],
            adminname: abc[1],
            comment: req.body.value.comment,
            updateddate: localTime,
            turnover: req.body.value.turnover
        })
        .then(function(result) {
            //console.log(result); 
            res.json('Enquiry Added Successfully');
        })
})


router.get('/getenquirylist/:pagesize/:page/:id', (req, res, next) => {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1));
    console.log(req.params.id);

    knex.select('enquirydata.*', 'loantype.loantype', 'employee.dob')
        .from('enquirydata')
        .join('loantype', 'loantype.idloantype', 'enquirydata.loantype')
        .join('employee', 'employee.idemployee', 'enquirydata.teleid')
        .where('enquirydata.teleid', req.params.id)
        .limit(pageSize).offset(skip)
        .then(function(result) {
            knex.select()
                .from('enquirydata')
                .join('loantype', 'loantype.idloantype', 'enquirydata.loantype')
                .join('employee', 'employee.idemployee', 'enquirydata.teleid')
                .where('enquirydata.teleid', req.params.id)
                .then(function(re) {
                    res.status(200).json({
                        message: "Memberlists fetched",
                        posts: result,
                        maxPosts: re.length
                    });
                })
        })
})


router.get('/enquirycount/:id', (req, res) => {
    console.log(req.params.id);
    knex.select()
        .from('enquirydata')
        .where({ teleid: req.params.id })
        .then(function(result) {
            console.log(result.length);
            res.json(result.length);
        })
})





router.get('/getPdlist/:pagesize/:page', function(req, res) {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1))
    knex.select('customer.*', 'loantype.loantype', 'employee.name as empname')
        .from('customer')
        .join('loantype', 'loantype.idloantype', 'customer.applytype')
        .join('employee', 'employee.idemployee', 'customer.idexecutive')
        .where({ 'customer.status': 'pd' })
        .limit(pageSize).offset(skip)
        .then(function(result) {

            knex.select()
                .from('customer')
                .join('loantype', 'loantype.idloantype', 'customer.applytype')
                .join('employee', 'employee.idemployee', 'customer.idexecutive')
                .where({ 'customer.status': 'pd' })
                .then(function(re) {
                    var a = re.length
                    console.log(a);
                    res.status(200).json({
                        message: "Memberlists fetched",
                        posts: result,
                        maxPosts: re.length
                    });
                })
        })
})

router.get('/getApprovallist/:pagesize/:page', function(req, res) {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1))
    knex.select('customer.*', 'loantype.loantype', 'employee.name as empname')
        .from('customer')
        .join('loantype', 'loantype.idloantype', 'customer.applytype')
        .join('employee', 'employee.idemployee', 'customer.idexecutive')
        .where({ 'customer.status': 'approve' })
        .limit(pageSize).offset(skip)
        .then(function(result) {

            knex.select()
                .from('customer')
                .join('loantype', 'loantype.idloantype', 'customer.applytype')
                .join('employee', 'employee.idemployee', 'customer.idexecutive')

            .where({ 'customer.status': 'approve' })
                .then(function(re) {
                    var a = re.length
                    console.log(a);
                    res.status(200).json({
                        message: "Memberlists fetched",
                        posts: result,
                        maxPosts: re.length
                    });
                })
        })
})


router.get('/getDisburstlist/:pagesize/:page', function(req, res) {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1))
    knex.select('customer.*', 'loantype.loantype', 'employee.name as empname')
        .from('customer')
        .join('loantype', 'loantype.idloantype', 'customer.applytype')
        .join('employee', 'employee.idemployee', 'customer.idexecutive')

    .where({ 'customer.status': 'disburse' })
        .limit(pageSize).offset(skip)
        .then(function(result) {

            knex.select()
                .from('customer')
                .join('loantype', 'loantype.idloantype', 'customer.applytype')
                .join('employee', 'employee.idemployee', 'customer.idexecutive')

            .where({ 'customer.status': 'disburse' })
                .then(function(re) {
                    var a = re.length
                    console.log(a);
                    res.status(200).json({
                        message: "Memberlists fetched",
                        posts: result,
                        maxPosts: re.length
                    });
                })
        })
})


router.post('/approve', (req, res) => {
    var date1 = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    var localTime = moment.utc(date1).toDate();

    console.log(req.body);
    knex('customer')
        .where({ idcustomer: req.body.idcustomer })
        .update({
            status: 'disburse',
            disbursedate: localTime,
            displaystatus: 'DISBURSED'
        })
        .then(function(result) {
            //console.log(result); 
        })
})

router.post('/pdapprove', (req, res) => {
    console.log(req.body);
    knex('customer')
        .where({ idcustomer: req.body.idcustomer })
        .update({
            status: 'approve',
            displaystatus: 'APPROVED'
        })
        .then(function(result) {
            //console.log(result); 
        })
})

router.post('/loginapprove', (req, res) => {
    console.log(req.body);
    knex.select()
        .from('customer')
        .whereNot({ status: 'active' })
        .then(function(re) {
            var length = re.length;
            console.log(length);
            var len = length + 1;
            console.log(len);
            knex.select()
                .from('loantype')
                .where('loantype.idloantype ', req.body.applytype)
                .then(function(re) {
                    if (req.body.subvendor == '' || req.body.subvendor == null || req.body.subvendor == null || req.body.subvendor == undefined) {
                        console.log("hi");
                        var code = re[0].code;
                        var x = Buffer.from(req.body.applieddate);
                        var y = x.slice(2, 4);
                        var abc = "MF" + code + y;
                        console.log(abc);
                        var autoid = abc + zeropad(len, 4)
                        console.log(autoid);
                        var password = generator.generate({
                            length: 8,
                            numbers: true
                        });
                    } else {
                        console.log("yes");
                        var code = re[0].code;
                        var x = Buffer.from(req.body.applieddate);
                        var y = x.slice(2, 4);
                        var abc = "VEN" + code + y;
                        console.log(abc);
                        var autoid = abc + zeropad(len, 4)
                        console.log(autoid);
                        var password = generator.generate({
                            length: 8,
                            numbers: true
                        });
                    }
                    //    var code=re[0].code;
                    // var x = Buffer.from(req.body.applieddate);
                    // var y = x.slice(2,4);
                    // var abc="MF"+code+y;
                    // console.log(abc);
                    // var autoid=abc+zeropad(len, 4)
                    // console.log(autoid);
                    //   var password = generator.generate({
                    //       length: 8,
                    //       numbers: true
                    //   });
                    var dob = req.body.dob;
                    const nowdate = format.asString('yyyy-MM-dd', new Date(dob));
                    var nowdate1 = moment().format(nowdate)
                    const encryptedString = sha1(password);


                    knex('customer')
                        .where({ idcustomer: req.body.idcustomer })
                        .update({
                            status: "pd",
                            autoid: autoid,
                            password: encryptedString,
                            orgpassword: password,
                            displaystatus: 'PD'
                        }).then(function(result) {
                            res.json('customer Updated Successfully');



                            knex.select()
                                .from('settings').where({ status: 'active' })
                                .then(function(resu) {
                                    console.log(resu);
                                    console.log(resu[0].idsetting);
                                    console.log(resu[0].emailuser);
                                    var emailuser = resu[0].emailuser;
                                    var emailpassword = resu[0].emailpassword;
                                    var hostmail = resu[0].hostmail;
                                    var resubject = resu[0].subject;
                                    var bsubject = resu[0].bsubject;

                                    var mloginlink = resu[0].mloginlink;
                                    var fromemail1 = resu[0].fromemail1;
                                    var regards = resu[0].regards;
                                    var cc = resu[0].cc;
                                    var bcc = resu[0].bcc;
                                    var address = resu[0].address;
                                    // res.json(resu);
                                    //                   const output = `











                                    //   <center style="width:100%;table-layout:fixed">
                                    //   <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#F5F7F8">
                                    //   <tbody><tr>
                                    //   <td>

                                    //   <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#F5F7F8">
                                    //   <tbody><tr>
                                    //   <td>    
                                    //        <div style="margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:0px;padding-right:0px">
                                    // <table align="center" style="border-spacing:0;font-family:sans-serif;color:#f5f7f8;Margin:0 auto;width:100%" bgcolor="#F5F7F8">
                                    //      <tbody><tr>
                                    // <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0" bgcolor="#F5F7F8">
                                    //       <table width="100%" style="border-spacing:0;font-family:sans-serif;color:#f5f7f8" bgcolor="#F5F7F8">
                                    //           <tbody><tr>
                                    //              <td style="padding-bottom:0px;padding-top:0px;padding-left:20px;
                                    //              padding-right:20px;background-color:#f5f7f8;color:#f5f7f8;width:100%;
                                    //              font-size:1px;line-height:1px;text-align:left;display:none!important">


                                    //           </td>
                                    //           </tr>           
                                    //       </tbody></table>
                                    //   </td>
                                    // </tr>
                                    // </tbody></table>
                                    //       </div>
                                    //       </td>
                                    //       </tr>
                                    //       </tbody></table>


                                    //               <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#F5F7F8">
                                    //   <tbody><tr>
                                    //   <td style="padding-bottom:20px">
                                    //        <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">

                                    // <table align="center"
                                    //  style="border-spacing:0;font-family:sans-serif;color:#111111;Margin:0 auto;width:100%;max-width:600px" bgcolor="#F5F7F8">
                                    //      <tbody><tr>
                                    // <td bgcolor="#F5F7F8" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
                                    //       <table width="73%" style="border-spacing:0;font-family:sans-serif;color:#111111" bgcolor="#F5F7F8">
                                    //           <tbody><tr>
                                    //                <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0px" 
                                    //                 width="109" 
                                    //                 height="103" 
                                    //                 alt="logo"
                                    //                  align="center">
                                    //                  <img style="display:block; line-height:0px; font-size:0px; 
                                    //                  border:0px;" src="https://dl2.pushbulletusercontent.com/CEyJvfyccHBYUunsWk8U99b6dkeV3s5Y/logo1.png" 
                                    //                  width="150" height="100" alt="logo">
                                    //  </td>
                                    //           </tr>

                                    //       </tbody></table>
                                    //   </td>

                                    // </tr>
                                    // </tbody></table>

                                    //       </div>
                                    //       </td>
                                    //       </tr>
                                    //       </tbody></table>


                                    //   <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
                                    //   <tbody><tr>
                                    //   <td bgcolor="#F5F7F8" style="background-color:#f5f7f8;padding-top:0;padding-right:0;padding-left:0;padding-bottom:0">
                                    //   <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">
                                    //     <table bgcolor="#FFFFFF" width="100%" align="center" border="0" cellspacing="0" cellpadding="0" style="font-family:sans-serif;color:#111111">
                                    //       <tbody><tr>
                                    //       <td bgcolor="#FFFFFF" align="center" style="word-break:break-all;padding-top:40px;padding-bottom:0;padding-right:40px;padding-left:40px;text-align:center;background-color:#ffffff;font-weight:bold;font-family:Arial,sans-serif,'Arial Bold','gdsherpa-bold';font-size:32px;line-height:42px" class="m_3203954183132274498h2mobile">

                                    //         <span>
                                    //         <a>Hi <b>`+ req.body.name + `,</b><br/>
                                    //         </a>
                                    //         </span>

                                    //       </td>
                                    //       </tr>
                                    //     </tbody></table>

                                    //   </div>
                                    // </td>
                                    // </tr>
                                    // </tbody></table>

                                    // <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
                                    // <tbody><tr>
                                    // <td bgcolor="#F5F7F8" style="background-color:#f5f7f8;padding-top:0;padding-right:0;padding-left:0;padding-bottom:0">
                                    // <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">	
                                    // <table bgcolor="#FFFFFF" width="100%" align="center" border="0" cellspacing="0" cellpadding="0" style="font-family:sans-serif;color:#111111">
                                    // <tbody><tr>
                                    // <td bgcolor="#FFFFFF" align="center" style="padding-top:15px;padding-bottom:0;padding-right:40px;padding-left:40px;text-align:center;background-color:#ffffff;font-weight:bold;font-family:Arial,sans-serif,'Arial Bold','gdsherpa-bold';font-size:21px;line-height:31px">
                                    // <span><a>
                                    // Thank you for Registering  with us .
                                    // </a></span>
                                    // </td>
                                    // </tr>
                                    // </tbody>
                                    // </table>
                                    // </div>
                                    // </td>
                                    // </tr>

                                    // </tbody></table>
                                    //   <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
                                    //      <tbody><tr>
                                    //         <td bgcolor="#F5F7F8" style="padding-top:0px;padding-bottom:0px">
                                    //            <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">

                                    //                        <table bgcolor="#FFFFFF" align="center" style="border-spacing:0;font-family:sans-serif;color:#111111;margin:0 auto;width:100%;max-width:600px">
                                    //                           <tbody><tr>
                                    //                              <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
                                    //                                 <table width="100%" style="border-spacing:0;font-family:sans-serif;color:#111111">
                                    //                                    <tbody><tr>
                                    //                                       <td style="padding-top:40px;padding-bottom:0px;padding-left:40px;padding-right:40px;background-color:#ffffff;width:100%;text-align:left">
                                    //                                          <p style="margin-top:0px;line-height:0px;margin-bottom:0px;font-size:4px">&nbsp;</p>
                                    //                                       </td>
                                    //                                    </tr>
                                    //                                 </tbody></table>
                                    //                              </td>
                                    //           </tr>
                                    //            </tbody></table>     
                                    //            </div>
                                    //         </td>
                                    //      </tr>
                                    //   </tbody></table>
                                    //   <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
                                    //      <tbody><tr>
                                    //         <td bgcolor="#F5F7F8" style="padding-top:0px;padding-bottom:0px">
                                    //            <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">

                                    //                        <table bgcolor="#1976D2" align="center" style="border-spacing:0;font-family:sans-serif;color:#ffffff;margin:0 auto;width:100%;max-width:600px">
                                    //                           <tbody><tr>
                                    //                              <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
                                    //                                 <table width="100%" style="border-spacing:0;font-family:sans-serif;color:#ffffff">
                                    //                                    <tbody><tr>
                                    //                                       <td style="padding-top:25px;padding-bottom:0px;padding-left:40px;padding-right:40px;background-color:#1976d2;width:100%;text-align:center">
                                    //                                          <p class="m_3203954183132274498bodycopy" 
                                    //                                          style="font-family:Arial,sans-serif,'gdsherpa-regular';margin-top:0px;font-size:16px;line-height:26px;margin-bottom:0px">
                                    //                                         YOUR PASSWORD:<b>`+ password + `</b>,
                                    //                                         <br/>CUSTOMER ID:<b>`+ autoid + `</b>
                                    //                                         <br/>
                                    //                                         </p>
                                    //                                       </td>
                                    //                                    </tr>
                                    //                                 </tbody></table>
                                    //                              </td>
                                    //                           </tr>





                                    //                                 <tr>
                                    //         <td bgcolor="#F5F7F8" style="padding-top:0px;padding-bottom:0px">
                                    //            <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:0px;padding-right:0px">

                                    //                        <table bgcolor="#FFFFFF" align="center" style="border-spacing:0;font-family:sans-serif;color:#111111;margin:0 auto;width:100%;max-width:600px">
                                    //                           <tbody><tr>
                                    //                              <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0  ">
                                    //                                 <table width="100%" style="border-spacing:0;font-family:sans-serif;color:#111111">
                                    //                                    <tbody><tr>
                                    //                                       <td style="padding-top:29px;font-size:23px;padding-bottom:0px;padding-left:40px;padding-right:40px;background-color:#ffffff;width:100%;text-align:center">


                                    //                                       <p style="font-size: 16px;">
                                    //                                       Click here to login <a href="`+ mloginlink + `" style="color: blue">"` + mloginlink + `"</a><br/>
                                    //                                        Our Executive Will Contact You Soon for <br/>Further Documentation Process.....</p>



                                    //                                       </td>
                                    //                                    </tr>
                                    //                                 </tbody></table>
                                    //                              </td>
                                    //                           </tr>
                                    //                        </tbody></table>

                                    //            </div>
                                    //         </td>
                                    //      </tr>



                                    //                        </tbody></table>

                                    //            </div>
                                    //         </td>
                                    //      </tr>
                                    //   </tbody></table>

                                    // <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
                                    //     <tbody>
                                    // 			</tbody></table>

                                    // 		</div>
                                    // 	</td>
                                    // 	</tr>
                                    // </tbody></table>

                                    //   <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
                                    //      <tbody>
                                    //   </tbody></table>
                                    // <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
                                    // 	<tbody><tr>
                                    // 		<td bgcolor="#F5F7F8" style="padding-top:0px;padding-bottom:0px">
                                    // 			<div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">

                                    // 				<table bgcolor="#FFFFFF" align="center" style="border-spacing:0;font-family:sans-serif;color:#111111;margin:0 auto;width:100%;max-width:600px">
                                    // 					<tbody><tr>
                                    // 						<td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
                                    // 							<table width="100%" style="border-spacing:0;font-family:sans-serif;color:#111111;table-layout:fixed">
                                    // 								<tbody><tr>
                                    // 									<td style="padding-top:15px;padding-bottom:0px;padding-left:40px;padding-right:40px;background-color:#ffffff;width:100%;text-align:left;word-break:break-all">
                                    //                   <p style="font-size:16px;"><b>Regards</b></p>
                                    //                   <p style="font-size: 16px;">`+ regards + `</p>
                                    //                   <p style="font-size: 16px;">`+ address + `</p>
                                    //                   <br>
                                    // 									</td>
                                    // 								</tr>
                                    // 							</tbody></table>
                                    // 						</td>
                                    // 					</tr>
                                    // 				</tbody></table>

                                    // 			</div>
                                    // 		</td>
                                    // 	</tr>
                                    // </tbody></table>
                                    //   <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
                                    //     <tbody><tr>
                                    //        <td bgcolor="#F5F7F8" style="padding-top:0px;padding-right:0;padding-left:0;padding-bottom:0px">
                                    //           <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">

                                    //                       <table bgcolor="#FFFFFF" width="100%" align="center" border="0" cellspacing="0" cellpadding="0" style="font-family:sans-serif;color:#ffffff">
                                    //                         <tbody><tr>
                                    //                            <td bgcolor="#FFFFFF" align="center" style="padding-top:20px;padding-bottom:0;padding-right:40px;padding-left:40px;text-align:center">
                                    //                               <table border="0" cellpadding="0" cellspacing="0" align="center" width="100%">
                                    //                                 <tbody><tr>
                                    //                                    <td align="center" style="padding-top:0;padding-right:0;padding-bottom:0;padding-left:0">
                                    //                                       <table border="0" cellspacing="0" cellpadding="0" align="center">
                                    //                                         <tbody><tr>
                                    //                                            <td align="center" style="font-size:18px;line-height:22px;font-weight:bold;font-family:Arial,sans-serif,'Arial Bold','gdsherpa-bold'">
                                    // 										   <span>
                                    // 										   </span></td>
                                    //                                         </tr>
                                    //                                       </tbody></table>
                                    //                                    </td>
                                    //                                 </tr>
                                    //                               </tbody></table>
                                    //                            </td>
                                    //                         </tr>
                                    //                       </tbody></table>

                                    //           </div>
                                    //        </td>
                                    //     </tr>
                                    //   </tbody></table>

                                    //   <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
                                    //      <tbody><tr>
                                    //         <td bgcolor="#F5F7F8" style="padding-top:0px;padding-bottom:0px">
                                    //            <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">

                                    //                        <table bgcolor="#FFFFFF" align="center" style="border-spacing:0;font-family:sans-serif;color:#111111;margin:0 auto;width:100%;max-width:600px">
                                    //                           <tbody><tr>
                                    //                              <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
                                    //                                 <table width="100%" style="border-spacing:0;font-family:sans-serif;color:#111111">
                                    //                                    <tbody><tr>
                                    //                                       <td style="padding-top:15px;padding-bottom:0px;padding-left:40px;padding-right:40px;background-color:#ffffff;width:100%;text-align:left">
                                    //                                       </td>
                                    //                                    </tr>
                                    //                                 </tbody></table>
                                    //                              </td>
                                    //                           </tr>
                                    //                        </tbody></table>

                                    //            </div>
                                    //         </td>
                                    //      </tr>
                                    //   </tbody></table>
                                    //   <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
                                    //      <tbody><tr>
                                    //         <td bgcolor="#F5F7F8" style="padding-top:0px;padding-bottom:0px">
                                    //            <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">

                                    //                        <table bgcolor="#FFFFFF" align="center" style="border-spacing:0;font-family:sans-serif;color:#111111;margin:0 auto;width:100%;max-width:600px">
                                    //                           <tbody><tr>
                                    //                              <td width="20" bgcolor="#FFFFFF" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0"><img src="https://ci5.googleusercontent.com/proxy/RICSIZJJJakoeRjSl1leY13zGXyq9_HKIqrwFRrOPA57xyZdbs53L1rQ4yhCH11-SspdFH__fOZOY6Z2y9DifqeOMXwq3pGBzw-CBms=s0-d-e1-ft#https://imagesak.secureserver.net/promos/std/spc_trans.gif" height="10" width="20" border="0" style="display:block;border-width:0" class="CToWUd"></td>
                                    //                              <td style="padding-top:25px;padding-bottom:0px;padding-right:0;padding-left:0;text-align:center;font-size:0;background-color:#ffffff">

                                    //                                          <div style="width:100%;max-width:560px;display:inline-block;vertical-align:top">
                                    //                                             <table width="100%" style="border-spacing:0;font-family:sans-serif;color:#111111">
                                    //                                                <tbody><tr>
                                    //                                                   <td style="padding-top:0px;padding-bottom:0px;padding-left:20px;padding-right:20px;background-color:#ffffff">
                                    //                                                      <table style="border-spacing:0;font-family:sans-serif;color:#111111;width:100%;font-size:14px;text-align:left;background-color:#ffffff;border-left-color:#fedc45;border-left-style:solid;border-left-width:3px">
                                    //                                                         <tbody><tr>
                                    //                                                            <td style="padding-top:0px;padding-bottom:0px;padding-left:20px;padding-right:20px;background-color:#ffffff;width:100%;text-align:left">
                                    //                                                            </td>
                                    //                                                         </tr>
                                    //                                                      </tbody></table>
                                    //                                                   </td>
                                    //                                                </tr>
                                    //                                             </tbody></table>
                                    //                                          </div>

                                    //                              </td>
                                    //                              <td width="20" bgcolor="#FFFFFF" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0"><img src="https://ci5.googleusercontent.com/proxy/RICSIZJJJakoeRjSl1leY13zGXyq9_HKIqrwFRrOPA57xyZdbs53L1rQ4yhCH11-SspdFH__fOZOY6Z2y9DifqeOMXwq3pGBzw-CBms=s0-d-e1-ft#https://imagesak.secureserver.net/promos/std/spc_trans.gif" height="10" width="20" border="0" style="display:block;border-width:0" class="CToWUd"></td>
                                    //                           </tr>
                                    //                        </tbody></table>

                                    //            </div>
                                    //         </td>
                                    //      </tr>
                                    //   </tbody></table>
                                    //   <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
                                    //      <tbody><tr>
                                    //         <td bgcolor="#F5F7F8" style="padding-top:0px;padding-bottom:0px">
                                    //            <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">

                                    //                        <table bgcolor="#FFFFFF" align="center" style="border-spacing:0;font-family:sans-serif;color:#111111;margin:0 auto;width:100%;max-width:600px">
                                    //                           <tbody><tr>
                                    //                              <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
                                    //                                 <table width="100%" style="border-spacing:0;font-family:sans-serif;color:#111111">
                                    //                                    <tbody><tr>
                                    //                                       <td style="padding-top:40px;padding-bottom:0px;padding-left:40px;padding-right:40px;background-color:#ffffff;width:100%;text-align:left">
                                    //                                       </td>
                                    //                                    </tr>
                                    //                                 </tbody></table>
                                    //                              </td>
                                    //                           </tr>
                                    //                        </tbody></table>

                                    //            </div>
                                    //         </td>
                                    //      </tr>
                                    //   </tbody></table>



























                                    //                 <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
                                    // <tbody><tr>
                                    // <td bgcolor="#F5F7F8" style="padding-top:0px;padding-bottom:0px">
                                    //     <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">

                                    // <table align="center" style="border-spacing:0;Margin:0 auto;width:100%;max-width:600px">
                                    //  <tbody><tr>
                                    // <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
                                    //     <table width="100%" style="border-spacing:0;font-family:sans-serif;color:#ffffff">
                                    //             <tbody><tr>
                                    //                 <td style="padding-top:40px;padding-bottom:0px;padding-left:40px;padding-right:40px;background-color:#f5f7f8;width:100%;text-align:left">
                                    //                 </td>
                                    //             </tr>
                                    //         </tbody></table>
                                    //     </td>
                                    // </tr>
                                    // </tbody></table>

                                    //         </div>
                                    //         </td>
                                    //         </tr>
                                    //         </tbody></table>


                                    //                 <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#E8EAEB">
                                    // <tbody><tr>
                                    // <td bgcolor="#E8EAEB" style="padding-top:0px;padding-bottom:0px">
                                    //     <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">

                                    // <table align="center" style="border-spacing:0;Margin:0 auto;width:100%;max-width:600px">
                                    //  <tbody><tr>
                                    // <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
                                    //     <table width="100%" style="border-spacing:0;font-family:sans-serif;color:#ffffff">
                                    //             <tbody><tr>
                                    //                 <td style="padding-top:40px;padding-bottom:0px;padding-left:40px;padding-right:40px;background-color:#e8eaeb;width:100%;text-align:left">
                                    //                 </td>
                                    //             </tr>
                                    //         </tbody></table>
                                    //     </td>
                                    // </tr>
                                    // </tbody></table>

                                    //         </div>
                                    //         </td>
                                    //         </tr>
                                    //         </tbody></table>


                                    //                   <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#E8EAEB">
                                    //      <tbody><tr>
                                    //         <td bgcolor="#E8EAEB" style="padding-top:0px;padding-bottom:0px">
                                    //            <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">

                                    //                        <table align="center" style="border-spacing:0;font-family:sans-serif;color:#757575;margin:0 auto;width:100%;max-width:600px">
                                    //                           <tbody><tr>
                                    //                              <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
                                    //                                 <table width="100%" style="border-spacing:0;font-family:sans-serif;color:#757575">
                                    //                                    <tbody><tr>
                                    //                                       <td style="padding-top:0px;padding-bottom:15px;padding-left:0px;padding-right:0px;background-color:#e8eaeb;width:100%;text-align:left">
                                    //                                       </td>
                                    //                                    </tr>
                                    //                                 </tbody></table>
                                    //                              </td>
                                    //                           </tr>
                                    //                        </tbody></table>

                                    //            </div>
                                    //         </td>
                                    //      </tr>
                                    //   </tbody></table>



                                    //                 <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#E8EAEB">
                                    // <tbody><tr><td bgcolor="#E8EAEB" style="padding-top:0px;padding-bottom:0px">
                                    // <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">

                                    // <table align="center" style="border-spacing:0;font-family:sans-serif;color:#757575;Margin:0 auto;width:100%;max-width:600px">
                                    //  <tbody><tr>
                                    // <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
                                    //         <table width="100%" style="border-spacing:0;font-family:sans-serif;color:#757575">
                                    //             <tbody><tr>
                                    //                 <td style="padding-top:0px;padding-bottom:25px;padding-left:0px;padding-right:0px;background-color:#e8eaeb;width:100%;text-align:left">

                                    //                           </td>
                                    //             </tr>
                                    //         </tbody></table>
                                    //     </td>
                                    // </tr>
                                    // </tbody></table>

                                    //         </div>
                                    //         </td>
                                    //         </tr>
                                    //         </tbody></table>





                                    //                 <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#E8EAEB">
                                    // <tbody><tr><td bgcolor="#E8EAEB" style="padding-top:0px;padding-bottom:0px">
                                    // <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">

                                    // <table align="center" style="border-spacing:0;font-family:sans-serif;color:#757575;Margin:0 auto;width:100%;max-width:600px">
                                    //  <tbody><tr>
                                    // <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
                                    //         <table width="100%" style="border-spacing:0;font-family:sans-serif;color:#757575">
                                    //             <tbody><tr>
                                    //                 <td style="padding-top:0px;padding-bottom:25px;padding-left:0px;padding-right:0px;background-color:#e8eaeb;width:100%;text-align:left">


                                    //                 </td>
                                    //             </tr>
                                    //         </tbody></table>
                                    //     </td>
                                    // </tr>
                                    // </tbody></table>

                                    //         </div>
                                    //         </td>
                                    //         </tr>
                                    //         </tbody></table>

                                    // 		</td>
                                    // 		</tr>
                                    // 		</tbody></table>
                                    //     </center>




















                                    //    `;

                                    let transporter = nodemailer.createTransport({
                                        host: hostmail,
                                        port: 587,
                                        transportMethod: 'SMTP',
                                        // secure: false, // true for 465, false for other ports
                                        auth: {
                                            user: emailuser, // gmail id
                                            pass: emailpassword // gmail password
                                        },
                                        tls: {
                                            rejectUnauthorized: false
                                        }
                                    });
                                    // setup email data with unicode symbols
                                    let mailOptions = {
                                        from: fromemail1,
                                        to: req.body.email, // list of receivers
                                        cc: cc,
                                        bcc: bcc,
                                        subject: bsubject, //"Project Payment Update From", // Subject line
                                        text: 'Hello world?', // plain text body
                                        html: output // html body
                                    };
                                    // send mail with defined transport object
                                    transporter.sendMail(mailOptions, (error, info) => {
                                        if (error) {
                                            return console.log(error);
                                        }
                                        console.log('Message sent: %s', info.messageId);
                                        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                                        res.render('contact', { msg: 'Email has been sent' });
                                    });
                                })





                        })
                })
        })
})

router.get('/dataentrycount', (req, res) => {
    knex.select()
        .from('customer')
        .where('customer.status', 'active')
        .then(function(result) {
            res.json(result.length);
        })
})

router.get('/pdcount', (req, res) => {
    knex.select()
        .from('customer')
        .where('customer.status', 'pd')
        .then(function(result) {
            res.json(result.length);
        })
})

router.get('/approvcount', (req, res) => {
    knex.select()
        .from('customer')
        .where('customer.status', 'approve')
        .then(function(result) {
            res.json(result.length);
        })
})
router.get('/disbursecount', (req, res) => {
    knex.select()
        .from('customer')
        .where('customer.status', 'disburse')
        .then(function(result) {
            res.json(result.length);
        })
})
router.get('/enqcount', (req, res) => {
    knex.select()
        .from('enquirydata')
        .join('employee', 'employee.idemployee', 'enquirydata.teleid')
        // .where('enquirydata.status','')
        .then(function(result) {
            res.json(result.length);
        })
})


router.post('/bankapply', (req, res) => {
    const vbs = req.body.arr;

    for (var j = 0; j < vbs.length; j++) {
        var applytype = vbs[j].loanid
        var bankname = vbs[j].bankid
        var amt = vbs[j].previousamounttaken
        var vendor = vbs[j].vendor
        knex('applybank')
            .insert({
                idloan: applytype,
                idbank: bankname,
                amount: amt,
                idcustomer: req.body.idvalue,
                status: 'PENDING',
                vendor: vendor
            }).then(function(result) {
                console.log(result);
            })
    }
})

router.get('/checktrack/:id', (req, res) => {
    console.log(req.params.id);
    knex.select()
        .from('customer')
        .where('customer.autoid', req.params.id)
        .then(function(result) {
            res.json(result);
        })
})


router.post('/onChange', (req, res) => {
    console.log(req.body);
    knex('applybank')
        .where({ idapplybank: req.body.idapplybank })
        .update({
            status: 'APPROVED'
        })
        .then(function(result) {
            //console.log(result); 
        })
})

router.get('/getApprovedBankList/:id', (req, res) => {
    knex.select('applybank.*', 'bank.bankname', 'loantype.loantype', 'topup.period as p')
        .from('applybank')
        .join('customer', 'customer.idcustomer', 'applybank.idcustomer')
        .join('bank', 'bank.idbank', 'applybank.idbank')
        .join('loantype', 'loantype.idloantype', 'applybank.idloan')
        .join('topup', 'topup.idtopup', 'applybank.idtopup')
        .where('applybank.idcustomer', req.params.id)
        .where('applybank.status', 'ACTIVE')
        .then(function(result) {
            res.json(result);
            console.log(result)
        })
})

router.get('/getApprovedBankListt/:id', (req, res) => {
    knex.select('applybank.*', 'bank.bankname', 'loantype.loantype')
        .from('applybank')
        .join('customer', 'customer.idcustomer', 'applybank.idcustomer')
        .join('bank', 'bank.idbank', 'applybank.idbank')
        .join('loantype', 'loantype.idloantype', 'applybank.idloan')
        .where('applybank.idcustomer', req.params.id)
        .where('applybank.status', 'APPROVED')
        .then(function(result) {
            res.json(result);
        })
})

router.get('/getRejectBankListt/:id', (req, res) => {
    knex.select('applybank.*', 'bank.bankname', 'loantype.loantype')
        .from('applybank')
        .join('customer', 'customer.idcustomer', 'applybank.idcustomer')
        .join('bank', 'bank.idbank', 'applybank.idbank')
        .join('loantype', 'loantype.idloantype', 'applybank.idloan')
        .where('applybank.idcustomer', req.params.id)
        .where('applybank.status', 'REJECTED')
        .then(function(result) {
            res.json(result);
        })
})

router.post('/addPeriod', (req, res) => {
    console.log(req.body);
    knex('applybank')
        .where({ idapplybank: req.body.obj.idapplybank })
        .update({
            pf: req.body.obj.pf,
            roi: req.body.obj.roi,
            idtopup: req.body.obj.idtopup,
            insurance: req.body.obj.insurance,
            status: 'ACTIVE',
            disbusdate: req.body.obj.screateddate,
            product: req.body.obj.product,
            disbusamount: req.body.obj.disbusamount

        })
        .then(function(result) {})
})


router.get('/singleCustomer/:id', (req, res) => {
    knex.select('customer.*', 'loantype.loantype')
        .from('customer')
        .join('loantype', 'loantype.idloantype', 'customer.applytype')
        .where({ idcustomer: req.params.id })
        .then(function(result) {
            res.json(result);
        })
})

router.get('/gettopuplist/:id', (req, res) => {
    // console.log(req.params.id);
    knex.select('applybank.disbusdate')
        .from('applybank')
        .where('applybank.idcustomer', req.params.id)
        .then(function(re) {
            // console.log(re[0].disbursedate);

            knex.select('applybank.*', 'bank.bankname', 'topup.period as p', 'topup.eligibleperiod')
                .from('applybank')
                .join('customer', 'customer.idcustomer', 'applybank.idcustomer')
                .join('topup', 'topup.idtopup', 'applybank.idtopup')
                .join('bank', 'bank.idbank', 'applybank.idbank')
                .where('applybank.idcustomer', req.params.id)
                .then(function(result) {
                    // console.log(result.length);
                    for (var i = 0; i < result.length; i++) {
                        var local = moment(re[0].disbursedate).local().format('YYYY-MM-DD ');
                        var ex1 = moment(local).add(result[i].eligibleperiod, 'month');
                        var local1 = moment(ex1).local().format('YYYY-MM-DD ');
                        // console.log(local1);
                        // console.log(ex1);
                        var q = moment(ex1).format("dddd, MMMM Do YYYY");
                        // console.log(result);
                        result[i].q = q;
                        // res.json({result});
                    }
                    res.json(result)
                })
        })
})

router.get('/getPeriod', (req, res) => {
    knex.select()
        .from('topup')
        .where({ status: 'active' })
        .then(function(result) {
            res.json(result);
        })
})


router.get('/checkcurrent/:id', (req, res) => {
    console.log(req.params);
    knex.select()
        .from('employee')
        .where({ email: req.params.id })
        .then(function(result) {
            console.log(result);
            if (result == undefined || result == '' || result == null) {
                console.log("hi")
                res.json({ status: true });
            } else {
                console.log("bye")
                res.json({
                    status: false
                });
            }
        });
})

router.post('/addtopup', (req, res) => {
    const nowdate1 = format.asString('yyyy-MM-dd', new Date());
    var date = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    var localTime = moment.utc(date).toDate();
    localTime = moment(localTime).format('YYYY-MM-DD HH:mm:ss');
    console.log("moment: " + localTime);

    if (req.body.idtopup != null) {
        knex('topup')
            .where({ idtopup: req.body.idtopup })
            .update({
                period: req.body.period,
                eligibleperiod: req.body.eligibleperiod
            })
            .then(function(result) {
                res.json('Topup Updated Successfully');
            })
    } else {

        knex('topup')
            .insert({
                period: req.body.period,
                status: "active",
                eligibleperiod: req.body.eligibleperiod
            })
            .then(function(result) {
                res.json('Topup Added Successfully');
            })
    }
})

router.get('/getperiodlist', function(req, res) {
    knex.select()
        .from('topup')
        .where('topup.status ', 'active')
        .then(function(result) {
            res.json(result);
        })
});

router.get('/rejectlist/:pagesize/:page', function(req, res) {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1))
    knex.select('customer.*', 'loantype.loantype', 'employee.name as empname')
        .from('customer')
        .join('loantype', 'loantype.idloantype', 'customer.applytype')
        .join('employee', 'employee.idemployee', 'customer.idexecutive')

    .where({ 'customer.status': 'reject' })
        .limit(pageSize).offset(skip)
        .then(function(result) {

            knex.select()
                .from('customer')
                .join('loantype', 'loantype.idloantype', 'customer.applytype')
                .join('employee', 'employee.idemployee', 'customer.idexecutive')

            .where({ 'customer.status': 'reject' })
                .then(function(re) {
                    var a = re.length
                    console.log(a);
                    res.status(200).json({
                        message: "Memberlists fetched",
                        posts: result,
                        maxPosts: re.length
                    });
                })
        })
})


router.post('/programinsert', (req, res) => {
    console.log(req.body);
    const nowdate1 = format.asString('yyyy-MM-dd', new Date());
    var date = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    var localTime = moment.utc(date).toDate();
    localTime = moment(localTime).format('YYYY-MM-DD HH:mm:ss');
    console.log("moment: " + localTime);

    if (req.body.id_program != null) {
        knex('programlist')
            .where({ id_program: req.body.id_program })
            .update({
                programname: req.body.programname
            })
            .then(function(result) {
                res.json('Programlist Updated Successfully');
            })
    } else {
        knex('programlist')
            .returning('id')
            .insert({
                programname: req.body.programname,
                status: "active"
            })
            .then(function(result) {
                res.json('Programlist Added Successfully');
            })
    }
})

router.get('/getprogramlist', (req, res) => {
    knex.select()
        .from('programlist')
        .where({ status: 'active' })
        .then(function(result) {
            res.json(result

            );
        })
})

//    router.get('/gettopupnotifylist',function(req,res){
//   knex.select()
//   .from('customer')
//   .where('customer.status','disburse')
//   .then(function(resu){
//   for(var i=0;i<resu.length;i++){
//   console.log(resu[i].disbursedate);
//   knex.select('applybank.*','bank.bankname','topup.period as p','topup.eligibleperiod')
//   .from('applybank')
//   .join('customer','customer.idcustomer','applybank.idcustomer')
//   .join('topup','topup.idtopup','applybank.idtopup')
//   .join('bank','bank.idbank','applybank.idbank')
//   .where('applybank.idcustomer',resu[i].idcustomer)
//   .then(function(result){ 
//   for(var j=0;j<result.length;j++){
// console.log(resu[j].disbursedate);
//   var local = moment(resu[j].disbursedate).local().format('YYYY-MM-DD ');
//   var ex1 =moment(local).add(result[j].eligibleperiod, 'month'); 
//   var local1 = moment(ex1).local().format('YYYY-MM-DD ');
//   var q=moment(ex1).format("dddd, MMMM Do YYYY");
//   resu[j].q=q;
//   console.log(resu[j]);
//   }
//   })
//   }
//   res.json(resu);
//   })
// })

router.get('/gettopupnotifylist/:obj', function(req, res) {

    knex.select('customer.*', 'applybank.*', 'topup.period as p', 'topup.eligibleperiod', 'employee.name as ename')
        .from('applybank')
        .join('customer', 'customer.idcustomer', 'applybank.idcustomer')
        .join('employee', 'employee.idemployee', 'customer.idexecutive')
        .join('topup', 'topup.idtopup', 'applybank.idtopup')
        .join('bank', 'bank.idbank', 'applybank.idbank')
        .where('customer.status', 'APPROVED')
        .where('customer.topupstatus', 'topup')
        .then(function(resu) {
            // console.log(resu);
            for (var i = 0; i < resu.length; i++) {
                var local = moment(resu[i].disbursedate).local().format('YYYY-MM-DD ');
                var ex1 = moment(local).add(resu[i].eligibleperiod, 'month');
                //  var local1 = moment(ex1).local().format('YYYY-MM-DD ');
                var q = moment(ex1).format("dddd, MMMM Do YYYY");
                resu[i].q = q;
                // console.log(q);
            }
            res.json(resu);
        })
})


router.post('/topUpSucess', function(req, res) {

    console.log(req.body);
    knex('applybank')
        .where({ idapplybank: req.body.idapplybank })
        .update({
            status: 'success'
        })
        .then(function(result) {
            //console.log(result); 
            res.json(result);
        })

})
router.get('/getexecutivetopuplist/:id', function(req, res) {

    knex.select('customer.*', 'customer.disbursedate', 'topup.period as p', 'topup.eligibleperiod', 'employee.name as ename')
        .from('applybank')
        .join('customer', 'customer.idcustomer', 'applybank.idcustomer')
        .join('employee', 'employee.idemployee', 'customer.idexecutive')
        .join('topup', 'topup.idtopup', 'applybank.idtopup')
        .join('bank', 'bank.idbank', 'applybank.idbank')
        .where('customer.status', 'disburse')
        .where('customer.topupstatus', 'topup')
        .where('customer.idexecutive', req.params.id)

    .then(function(resu) {
        console.log(resu);
        for (var i = 0; i < resu.length; i++) {
            var local = moment(resu[i].disbursedate).local().format('YYYY-MM-DD ');
            var ex1 = moment(local).add(resu[i].eligibleperiod, 'month');
            //  var local1 = moment(ex1).local().format('YYYY-MM-DD ');
            var q = moment(ex1).format("dddd, MMMM Do YYYY");
            resu[i].q = q;
            console.log(q);
        }
        res.json(resu);
    })
})


// router.get('/getsuccesstopuplist',function(req,res){
//   knex.select()
//   .from('customer')
//   .where({topupstatus:'success'})
//   .then(function(result){  
//     //console.log(result); 
//     res.json(result);
//   })    
// })

router.get('/getSubVendor', function(req, res) {
    knex.select()
        .from('employee')
        .join('usertype', 'usertype.idusertype', 'employee.iduser')
        .where('usertype.user', 'SUB VENDOR')
        .then(function(result) {
            res.json(result)
        })
})

router.get('/customerList/:id', function(req, res) {
        console.log(req.params);
        knex.select('customer.*')
            .from('customer')
            .join('employee', 'employee.idemployee', 'customer.subvendor')
            .where('customer.subvendor', req.params.id)
            .then(function(result) {
                res.json(result)
            })

    })
    //  router.post('/addPayOut',function(req,res){
    //    console.log(req.body);
    //    knex('accountdetails')
    //    .insert({
    //     bankname:req.body.bankname,
    //     accountno:req.body.accountno,
    //     amount:req.body.amount,
    //     idcustomer:req.body.id,
    //     casename:req.body.casename
    //    })
    //    .then(function(result){  
    //      res.json('Accountdetails Added Successfully');
    //    })
    //  })
router.post('/addPayOut', (req, res) => {
    var date = new Date();
    year = date.getFullYear();
    month = date.getMonth() + 1;
    dt = date.getDate();

    if (dt < 10) {
        dt = '0' + dt;
    }
    if (month < 10) {
        month = '0' + month;
    }
    var date1 = year + '-' + month + '-' + dt;
    console.log(date1);
    console.log(req.body);
    if (req.body.idaccountdetails != null) {
        knex('accountdetails')
            .where({ idaccountdetails: req.body.idaccountdetails })
            .update({
                bankname: req.body.bankname,
                accountno: req.body.accountno,
                amount: req.body.amount,
                idcustomer: req.body.id,
                casename: req.body.casename,
                updateddate: date1

            })
            .then(function(result) {
                res.json('Payout Updated Successfully');
            })
    } else {
        knex('accountdetails')
            .insert({
                bankname: req.body.bankname,
                accountno: req.body.accountno,
                amount: req.body.amount,
                idcustomer: req.body.id,
                casename: req.body.casename,
                status: 'active',
                createddate: date1

            })
            .then(function(result) {
                res.json('Payout Added Successfully');
            })
    }
})







router.get('/getDisburseCustomerList', function(req, res) {
    knex.select()
        .from('customer')
        .where({ status: 'disburse' })
        .then(function(result) {
            res.json(result)
        })
})

router.post('/savePayout', function(req, res) {
    console.log(req.body);
    knex('applybank')
        .where({ idapplybank: req.body.idapplybank })
        .update({
            payout: req.body.payout
        })
        .then(function(result) {
            res.json('Payout Updated Successfully');
        })
})

router.post('/checknumber', function(req, res) {
        console.log(req.body);
        knex.select()
            .from('customer')
            .where({ idno: req.body.idno })
            .then(function(result) {
                //  console.log(result);
                if (result == undefined || result == '' || result == null) {
                    // console.log("hi")
                    res.json({ status: false, });
                } else {
                    console.log("bye")
                    res.json({
                        result: result,
                        status: true,
                    });
                }
                //  res.json('result')
            })
    })
    //   res.json('res');
    // })



router.get('/getvendornames', function(req, res) {
    knex.select('employee.*')
        .from('employee')
        .join('usertype', 'usertype.idusertype', 'employee.iduser')
        .where('usertype.user', 'SUB VENDOR')
        .then(function(result) {
            res.json(result)
        })

})



router.get('/gettranscationdata/:id', function(req, res) {
    console.log(req.params);
    knex.select('accountdetails.*', 'accountdetails.amount as aamount')
        .from('accountdetails')
        .join('customer', 'customer.idcustomer', 'accountdetails.idcustomer')
        .where('accountdetails.status', 'active')
        .where('accountdetails.idcustomer', req.params.id)
        .then(function(result) {
            console.log(result);

            res.json(result)
        })
})

router.get('/getApproveBankList/:id', function(req, res) {
    console.log("hiii");
    console.log(req.params.id);
    knex.select('applybank.*', 'bank.*', 'loantype.*')
        .from('applybank')
        .join('customer', 'customer.idcustomer', 'applybank.idcustomer')
        .join('bank', 'bank.idbank', 'applybank.idbank')
        .join('loantype', 'loantype.idloantype', 'applybank.idloan')
        .where('applybank.status', 'ACTIVE')
        .where('applybank.idcustomer', req.params.id)
        .then(function(result) {
            // console.log(result);

            res.json(result)
        })
})


router.post('/reloanapply',
    upload.fields([{ name: 'cimage' }, , { name: 'pimage' },
        { name: 'aimage' }
    ]), (req, res) => {
        var dob = req.body.dob;
        var applieddate = req.body.applieddate;
        const nowdate1 = format.asString('yyyy-MM-dd', new Date(dob));
        const nowdate = format.asString('yyyy-MM-dd', new Date(applieddate));
        let config = req.body.arr;
        console.log(config);
        if (req.files.cimage != null) {
            cimage = req.files.cimage[0]['filename'];
        } else {
            cimage = req.body.cimage;
        }

        if (req.files.pimage != null) {
            pimage = req.files.pimage[0]['filename'];
        } else {
            pimage = req.body.pimage;
        }

        if (req.files.aimage != null) {
            aimage = req.files.aimage[0]['filename'];
        } else {
            aimage = req.body.aimage;
        }
        knex('customer')
            .where('idcustomer', req.body.idcustomer)
            .update({
                email: req.body.email,
                cemail: req.body.cemail,
                dob: nowdate1,
                salary: req.body.salary,
                altmobile: req.body.altmobile,
                address: req.body.address,
                cname: req.body.cname,
                designation: req.body.designation,
                caddress: req.body.caddress,
                pincode: req.body.pincode,
                idexecutive: req.body.idexecutive,
                gender: req.body.gender,
                amount: req.body.amount,
                applytype: req.body.applytype,
                cimage: cimage,
                pimage: pimage,
                aimage: aimage,
                status: 'active',
                displaystatus: 'Pending',
                applieddate: nowdate,
                source: 'Application',
                documents: req.body.documents,
                idno: req.body.idno,
                subvendor: req.body.subvendor,
                topupstatus: 'topup',
                sourcetype: req.body.sourcetype,
                aadharno: req.body.aadharno,
                panno: req.body.panno,
                dlno: req.body.dlno,
                voterno: req.body.voterno,
                emptype: req.body.emptype,
                editby: req.body.createdby
            })

        // .returning('id')
        .then(function(idcustomer) {
            console.log(config);
            console.log(config1);
            const ids = idcustomer.toString();
            if (config == undefined || config == 'undefined') {
                res.json("Not Inserted");
                console.log("empty data")
            } else {
                const vbs = JSON.parse(config);
                for (var j = 0; j < vbs.length; j++) {
                    var previousapplytype = vbs[j].loanid
                    var previousbankname = vbs[j].bankid
                    var previousamounttaken = vbs[j].previousamounttaken
                    var roi = vbs[j].roi
                    var pf = vbs[j].pf
                    var pl = vbs[j].pl
                    var insurance = vbs[j].insurance
                    var maturity = vbs[j].maturity
                    const pmaturity = format.asString('yyyy-MM-dd', new Date(maturity));
                    var startdate = vbs[j].startdate
                    const pstartdate = format.asString('yyyy-MM-dd', new Date(startdate));
                    knex('previousbankdetails')
                        .insert({
                            idloantype: previousapplytype,
                            idbank: previousbankname,
                            amount: previousamounttaken,
                            roi: roi,
                            pf: pf,
                            pl: pl,
                            idcustomer: ids,
                            insurance: insurance,
                            startdate: pstartdate,
                            maturity: pmaturity
                        }).then(function(re) {
                            res.json(re);
                        })
                }
            }
            if (config1 == undefined || config1 == 'undefined') {
                res.json("Not Inserted");
                console.log("empty data")
            } else {
                const vbs1 = JSON.parse(config1);
                for (var j = 0; j < vbs1.length; j++) {
                    var coname = vbs1[j].coname
                    var copaddress = vbs1[j].copaddress
                    var coraddress = vbs1[j].coraddress

                    knex('co-customer')
                        .insert({
                            coappname: coname,
                            coappresaddress: copaddress,
                            coappperaddress: coraddress,
                            idcustomer: ids

                        }).then(function(re) {
                            res.json(re);
                        })
                }
            }

        })
    });

router.post('/bulkSms', function(req, res) {
    console.log(req.body);

    knex.select('customer.mobile')
        .from('customer')
        .where({ status: 'disburse' })
        .then(function(result) {
            res.json(result)


            for (var i = 0; i < result.length; i++) {
                request('http://13.127.28.222/vendorsms/pushsms.aspx?apikey=ef23d052-14d5-409e-b78a-becf4ad3dea6&clientid=a4fdddfc-9f2d-4bae-97a6-95f5496f5335&msisdn=' + result[i].mobile + '&sid=MAVYAH&msg=' + req.body.message + '&fl=0&gwid=2',
                    function(err, res, body) {
                        if (!err && res.statusCode == 200) {
                            console.log(body);
                        }
                    })

            }
        })

})

router.post('/getDetails', function(req, res) {
    console.log(req.body);
    knex.select('loantype.loantype', 'employee.name as ename', 'customer.*')
        .from('customer')
        // .join('previousbankdetails','previousbankdetails.idcustomer','customer.idcustomer')
        .join('employee', 'employee.idemployee', 'customer.idexecutive')
        .join('loantype', 'loantype.idloantype', 'customer.applytype')
        .where({ autoid: req.body.bankname })
        .then(function(result) {
            res.json(result)
        })
})

router.post('/getPreviousBankDetails', function(req, res) {

    knex.select('customer.name as cname', 'bank.bankname', 'loantype.loantype', 'previousbankdetails.*')

    .from('previousbankdetails')
        .join('customer', 'customer.idcustomer', 'previousbankdetails.idcustomer')
        .join('loantype', 'loantype.idloantype', 'previousbankdetails.idloantype')
        .join('bank', 'bank.idbank', 'previousbankdetails.idbank')
        .where('customer.autoid', req.body.bankname)
        .then(function(result) {
            res.json(result)
        })
})

router.post('/getApprovedBankDetails', function(req, res) {
    knex.select('customer.name as cname', 'bank.bankname', 'loantype.loantype', 'applybank.*')
        .from('applybank')
        .join('customer', 'customer.idcustomer', 'applybank.idcustomer')
        .join('loantype', 'loantype.idloantype', 'applybank.idloan')
        .join('bank', 'bank.idbank', 'applybank.idbank')
        .where('customer.autoid', req.body.bankname)
        .where('applybank.status', 'ACTIVE')
        .then(function(result) {
            res.json(result)
        })
})

router.post('/accountdetails', function(req, res) {
    knex.select('accountdetails.*')
        .from('accountdetails')
        .join('customer', 'customer.idcustomer', 'accountdetails.idcustomer')
        .where('customer.autoid', req.body.bankname)
        //  .where('applybank.status','ACTIVE')
        .then(function(result) {
            res.json(result)
        })
})
























//Android Apis

//signup
router.post('/androidsignup', upload.fields([{ name: 'file' }]), (req, res) => {
    console.log(req.files);
    console.log(req.body);
    console.log("hiii");

    var gen = otpGenerator.generate(5, { upperCase: false, specialChars: false, alphabets: false });
    console.log(gen);
    // res.json({gen});
    var message = urlencode('Mindfin One Time Password For Sign up is ' + gen);
    var mobile = req.body.mobile;

    knex('customer')
        .insert({
            name: req.body.name,
            mobile: req.body.mobile,
            email: req.body.email,
            address: req.body.address,
            dob: req.body.dob,
            pincode: req.body.pincode,
            altmobile: req.body.altmobile,
            gender: req.body.gender,
            otp: gen
        })
        .then(function(result) {
            res.json('Customer Added Successfully');
        })
    console.log(mobile);
    request('http://13.127.28.222/vendorsms/pushsms.aspx?apikey=ef23d052-14d5-409e-b78a-becf4ad3dea6&clientid=a4fdddfc-9f2d-4bae-97a6-95f5496f5335&msisdn=' + mobile + '&sid=MAVYAH&msg=' + message + '&fl=0&gwid=2',
        function(err, res, body) {
            if (!err && res.statusCode == 200) {
                console.log(body);
            }
        })
})

//login
router.get('/androidadminlogin', (req, res) => {
    console.log(req.query.username);
    console.log("hiii");
    const username = req.query.username;
    const password = (sha1(req.query.password));
    knex.select()
        .from('employee')
        .join('usertype', 'usertype.idusertype', 'employee.iduser')
        .where({ email: username, password: password })
        .then(function(result) {
            console.log(result);
            if (result[0] == '' || result[0] == undefined || result[0] == 0 || result[0] == null) {
                knex.select()
                    .from('customer')
                    .where({ email: username, password: password })
                    .then(function(result1) {
                        res.json({
                            result: result1[0],
                            message: 'customer'
                        })
                    })
            } else if (result[0].user == 'SUPERADMIN') {
                console.log('admin');
                res.json({
                    result: result[0],
                    message: 'admin'
                })
            } else if (result[0].user == 'EXECUTIVE') {
                console.log('executive');

                res.json({
                    result: result[0],
                    message: 'executive'
                })
            } else if (result[0].user == 'DATAENTRY') {
                console.log('dataentry');
                res.json({
                    result: result[0],
                    message: 'dataentry'
                })
            } else {
                console.log('telecallers');
                res.json({
                    result: result[0],
                    message: 'telecallers'
                })
            }
        })
})


//checkotp
router.get('/checkotp', (req, res) => {
    const otpno = req.query.otpno;
    knex.select()
        .from('customer')
        .where({ otp: otpno })
        .then(function(result) {
            res.json({
                result: result[0],
                message: 'true'
            })
        })
})


//banklist
router.get('/getbanklist1', (req, res) => {
    knex.select()
        .from('bank')
        .where('bank.status', 'active')
        .then(function(result) {
            res.json({
                result: result,
                message: "Data found sucessfully",
                success: '1'
            });
        })
})

//loanlist
router.get('/getloanlist1', (req, res) => {
    knex.select()
        .from('loantype')
        .where('loantype.status', 'active')
        .then(function(result) {
            res.json({
                result: result,
                message: "Data found sucessfully",
                success: '1'
            });
        })
})

//pdlist
router.get('/getandroidpdlist', (req, res) => {
    knex.select()
        .from('customer')
        .where('customer.status', 'pd')
        .then(function(result) {
            //console.log(result); 
            res.json(result);
        })
})

//pdlistcount
router.get('/getandroidpdcount', (req, res) => {
    knex.select()
        .from('customer')
        .where('customer.status', 'pd')
        // .where('customer.displaystatus','Approved')
        .then(function(result) {
            res.json({
                result: result.length,
                status: 'true'
            });
        })
})

//logincount
router.get('/getandroidlogincount', (req, res) => {
    knex.select()
        .from('customer')
        .where('customer.status', 'active')
        // .where('customer.displaystatus','Pending')
        .then(function(result) {
            res.json({
                result: result.length,
                status: 'true'
            });
        })
})

//loginlist
router.get('/getandroidloginlist', (req, res) => {
    knex.select()
        .from('customer')
        .where('customer.status', 'active')
        // .where('customer.displaystatus','Pending')
        .then(function(result) {
            res.json(result);
        })
})


//rejectcount
router.get('/getrejectcustomercount', (req, res) => {
    knex.select()
        .from('customer')
        .where('customer.status', 'reject')
        // .where('customer.displaystatus','Reject')
        .then(function(result) {
            res.json({
                result: result.length,
                status: 'true'
            });
        })
})

//rejectlist
router.get('/getrejectcustomerlist', (req, res) => {
    knex.select()
        .from('customer')
        .where('customer.status', 'reject')
        // .where('customer.displaystatus','Reject')
        .then(function(result) {
            res.json(result);
        })
})

//executivecount
router.get('/getexecutivecount', (req, res) => {
        knex.select()
            .from('employee')
            .join('usertype', 'usertype.idusertype', 'employee.iduser')
            .where('usertype.user ', 'EXECUTIVE')
            .where('employee.status ', 'active')
            .then(function(result) {
                res.json({
                    result: result.length,
                    status: 'true'
                });
            })
    })
    // //approved list in id
    //   router.get('/getlist',(req,res)=>{
    //     console.log(req.query);
    //     knex.select('customer.*,employee.name as ename')
    //     .from('customer')
    //     .join('employee','employee.idemployee','customer.idexecutive')
    //     .where('customer.idcustomer',req.query.id)
    //     .then(function(result){  
    //       res.json(result[0]);
    //     })    
    //   })
    //
    // router.get('/androidadminlogin1',(req,res)=>{
    //   console.log(req.query.username);
    //   console.log("hiii");
    // const username= req.query.username;
    // const password = (sha1(req.query.password));
    // knex.select()
    // .from('employee')
    // .join('usertype','usertype.idusertype','employee.iduser')
    // .where({email:username,password:password})
    // .then(function(result){  
    // if(result[0]==''||result[0]==undefined||result[0]==0||result[0]==null)
    // {
    //   knex.select()
    //   .from('approvedcustomer')
    //   .where({email:username,password:password})
    //   .then(function(result1){ 
    // res.json(result1[0],
    //   // message:'customer'
    // )
    // })
    // }
    // else if(result[0].user=='ADMIN')
    // {
    // res.json(result[0],
    //   // message:'admin'
    // )
    // }
    // else{
    //   res.json(result[0],
    //     // message:'executive'

// )
// }
// })
// })


//emplist
router.get('/getemployeelist1', (req, res) => {
    knex.select()
        .from('employee')
        .join('usertype', 'usertype.idusertype', 'employee.iduser')
        .where('employee.status', 'active')
        .where('usertype.user', 'EXECUTIVE')

    .then(function(result) {
        res.json(result);
    })
})


//emplist by id
router.get('/getemplist', (req, res) => {
    console.log(req.query);
    knex.select()
        .from('employee')
        .join('usertype', 'usertype.idusertype', 'employee.iduser')
        .where('employee.status', 'active')
        .where('employee.idemployee', req.query.id)
        .then(function(result) {
            res.json(result[0]);
        })
})

//approvelist
router.get('/getandroidapprovelist', (req, res) => {
    knex.select()
        .from('customer')
        .where('customer.status', 'approve')
        .then(function(result) {
            //console.log(result); 
            res.json(result);
        })
})

//approvecount
router.get('/getandroidapprovecount', (req, res) => {
    knex.select()
        .from('customer')
        .where('customer.status', 'approve')
        // .where('customer.displaystatus','Approved')
        .then(function(result) {
            res.json({
                result: result.length,
                status: 'true'
            });
        })
})

//disburselist
router.get('/getandroiddisburselist', (req, res) => {
    knex.select()
        .from('customer')
        .where('customer.status', 'disburse')
        .then(function(result) {
            //console.log(result); 
            res.json(result);
        })
})

//disbursecount
router.get('/getandroiddisbursecount', (req, res) => {
    knex.select()
        .from('customer')
        .where('customer.status', 'disburse')
        // .where('customer.displaystatus','Approved')
        .then(function(result) {
            res.json({
                result: result.length,
                status: 'true'
            });
        })
})


//disburselist
router.get('/getandroidtelecallerlist', (req, res) => {
    knex.select()
        .from('employee')
        .join('usertype', 'usertype.idusertype', 'employee.iduser')
        .where('employee.status', 'active')
        .where('usertype.user', 'TELECALLER')
        .then(function(result) {
            //console.log(result); 
            res.json(result);
        })
})

//disbursecount
router.get('/getandroidtelecallercount', (req, res) => {
    knex.select()
        .from('employee')
        .join('usertype', 'usertype.idusertype', 'employee.iduser')
        .where('employee.status', 'active')
        .where('usertype.user', 'TELECALLER')
        .then(function(result) {
            res.json({
                result: result.length,
                status: 'true'
            });
        })
})

router.get('/getandroiddataentrylist', (req, res) => {
    knex.select()
        .from('employee')
        .join('usertype', 'usertype.idusertype', 'employee.iduser')
        .where('employee.status', 'active')
        .where('usertype.user', 'DATAENTRY')
        .then(function(result) {
            //console.log(result); 
            res.json(result);
        })
})

//disbursecount
router.get('/getandroiddataentrycount', (req, res) => {
    knex.select()
        .from('employee')
        .join('usertype', 'usertype.idusertype', 'employee.iduser')
        .where('employee.status', 'active')
        .where('usertype.user', 'DATAENTRY')
        .then(function(result) {
            res.json({
                result: result.length,
                status: 'true'
            });
        })
})

router.post('/settings', upload.fields([{ name: 'leftimg' }]), (req, res) => {
    console.log(req.body);
    console.log(req.files);

    if (req.files.leftimg != null) {
        image = req.files.leftimg[0]['filename'];
    } else {
        image = req.body.leftimg;
    }
    console.log(image)
    knex('settings')
        .where({ idsetting: req.body.idsetting })
        .update({
            emailpassword: req.body.emailpassword,
            emailuser: req.body.emailuser,
            fromemail1: req.body.fromemail1,
            fromemail2: req.body.fromemail2,
            hostmail: req.body.hostmail,
            mloginlink: req.body.mloginlink,
            subject: req.body.subject,
            regards: req.body.regards,
            cc: req.body.cc,
            bcc: req.body.bcc,
            bsubject: req.body.bsubject,
            status: 'active',
            address: req.body.address,
            image: image
        })
        .then(function(result) {
            console.log(result);
            res.json('Settings Updated Successfully');
        })

});


router.get('/settinglist', (req, res) => {
    knex.select()
        .from('settings')
        // .count('member_table.pname as total')  
        // .join('member_table','member_table.pname','project.idproject')
        // .groupBy('member_table.pname')
        .then(function(result1) {
            res.json(result1);
        })
});

//approved list in id
router.get('/getlist', (req, res) => {
    console.log(req.query);
    knex.select('customer.*', 'employee.name as ename')
        .from('customer')
        .join('employee', 'employee.idemployee', 'customer.idexecutive')
        .where('customer.idcustomer', req.query.id)
        .then(function(result) {
            res.json(result[0]);
        })
})

router.get('/getappliedloanlist', (req, res) => {
    // console.log(req.query);
    knex.select('applybank.*', 'bank.bankname', 'loantype.loantype')
        .from('applybank')
        .join('loantype', 'loantype.idloantype', 'applybank.idloan')
        .join('bank', 'bank.idbank', 'applybank.idbank')
        .join('customer', 'customer.idcustomer', 'applybank.idcustomer')
        .where('applybank.idcustomer', req.query.id)
        .then(function(result) {
            res.json(result);
        })
})

router.get('/getsuccesstopuplist/:pagesize/:page', function(req, res) {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1))

    knex.select()
        .from('customer')
        .where({ topupstatus: 'success' })
        .limit(pageSize).offset(skip)
        .then(function(result) {
            //   res.json(result);
            // })    
            // knex.select('customer.*','loantype.loantype','employee.name as empname')
            // .from('customer')
            // .join('loantype','loantype.idloantype','customer.applytype')
            // .join('employee','employee.idemployee','customer.idexecutive')
            // .where ({'customer.status':'approve'})
            // .limit(pageSize).offset(skip)
            // .then(function(result){

            knex.select()
                .from('customer')
                .where({ topupstatus: 'success' })
                .then(function(re) {
                    var a = re.length
                        // console.log(a);
                    res.status(200).json({
                        message: "Memberlists fetched",
                        posts: result,
                        maxPosts: re.length
                    });
                })
        })
})
router.post('/checkaadharnumber', function(req, res) {
        console.log(req.body);
        knex.select()
            .from('customer')
            .where({ aadharno: req.body.aadharno })
            .then(function(result) {
                if (result == undefined || result == '' || result == null) {

                    res.json({ status: false });
                } else {
                    console.log("bye")
                    res.json({
                        result: result,
                        status: true,
                    });
                }

            })
    })
    //   res.json('res');
    // })
router.post('/checkpannumber', function(req, res) {
    console.log(req.body.panNo);
    knex.select()
        .from('customer')
        .where({ panno: req.body.panNo })
        .then(function(result) {

            if (result == undefined || result == '' || result == null) {

                res.json({ status: false, });
            } else {
                console.log("bye")
                res.json({
                    result: result,
                    status: true,
                });
            }

        })
})

router.post('/checkdlnumber', function(req, res) {
    console.log(req.body);
    knex.select()
        .from('customer')
        .where({ dlno: req.body.dlNo })
        .then(function(result) {

            if (result == undefined || result == '' || result == null) {

                res.json({ status: false, });
            } else {
                console.log("bye")
                res.json({
                    result: result,
                    status: true,
                });
            }

        })
})

router.post('/checkvoternumber', function(req, res) {
    console.log(req.body);
    knex.select()
        .from('customer')
        .where({ voterno: req.body.voterNo })
        .then(function(result) {

            if (result == undefined || result == '' || result == null) {

                res.json({ status: false, });
            } else {
                console.log("bye")
                res.json({
                    result: result,
                    status: true,
                });
            }

        })
})
router.get('/getemployeename/:id', (req, res) => {
    console.log(req.params.id);
    knex.select()
        .from('employee')
        .where({ idemployee: req.params.id })
        .then(function(result) {
            console.log(result);
            res.json(result);
        })
});
// router.get('/getemployeetypelist',(req,res)=>{
//   knex.select('emp_type')
//   .from('employeetype')
//   .then(function(result){
//     res.json(result);
//   })
// })
router.get('/rejectcustomer/:obj/:obj1', function(req, res) {
    // console.log(req.params.obj);
    // console.log(req.params.obj1);
    var date3 = format.asString('yyyy-MM-dd', new Date());
    knex('customer')
        .where({ idcustomer: req.params.obj1 })
        .update({
            status: "reject",
            displaystatus: "Reject",
            reject_reason: req.params.obj,
            updateddate: moment().format(date3)
        }).then(function(result) {
            // console.log(result); 
            res.json('Approved custome Rejected Successfully');
        })
});
router.get('/rejectbank/:obj/:obj1', function(req, res) {
    // console.log(req.params.obj);
    // console.log(req.params.obj1);

    knex('applybank')
        .where({ idapplybank: req.params.obj1 })
        .update({
            status: "REJECTED",
            reject_reason: req.params.obj,

        }).then(function(result) {
            // console.log(result); 
            res.json('Approved custome Rejected Successfully');
        })
});

router.get('/getbankname', (req, res) => {
    knex.select()
        .from('bank')
        .then(function(result) {
            res.json(result);
        })
});
// router.post('/addroutine/:empid', (req, res) => {
//   const nowdate = format.asString('yyyy-MM-dd', new Date());

//   knex('daily_routine')
//     .insert({
//       companyname: req.body.companyname,
//       bankid: req.body.bankname,
//       whosecase: req.body.whosecase,
//       status: req.body.status,
//       employeeid: req.params.empid,
//       createddate: nowdate
//     })
//     .then(function (result) {
//       res.json('daily_routine Added Successfully');
//     })
// });
router.post('/addroutine', (req, res) => {
    const vbs = req.body.arr;
    const nowdate = format.asString('yyyy-MM-dd', new Date());
    for (var j = 0; j < vbs.length; j++) {
        // var backendid = vbs[j].loanid
        var companyname = vbs[j].companyname
        var bankid = vbs[j].bankid
        var status = vbs[j].status
        var whosecase = vbs[j].whosecase
        var comment = vbs[j].comment
        knex('daily_routine')
            .insert({
                bankid: bankid,
                companyname: companyname,
                whosecase: whosecase,
                employeeid: req.body.idvalue,
                status: status,
                createddate: nowdate,
                comment: comment
            }).then(function(result) {
                console.log(result);
            })
    }
});
router.get('/editdataa/:id', function(req, res) {
    knex.select('enquirydata.*', 'employee.idemployee as executive', 'enquirydata.createddate as enqdate', 'loantype.idloantype as applytype')
        .from('enquirydata')
        .join('employee', 'employee.idemployee', 'enquirydata.executiveid')
        .join('loantype', 'loantype.idloantype', 'enquirydata.loantype')
        // .join('previousbankdetails','previousbankdetails.idcustomer','customer.idcustomer')
        .where('enquirydata.idenquiry', req.params.id)
        .then(function(result) {
            console.log(result);
            res.json(result);
        })
});
router.post('/updateenquiry', (req, res) => {
    console.log(req.body);
    // var applieddate = req.body.value.enqdate;
    // console.log(applieddate);
    // const localTime = format.asString('yyyy-MM-dd', new Date());
    // var date1 = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    var localTime = format.asString('yyyy-MM-dd', new Date());
    knex('enquirydata')
        .where('idenquiry', req.body.idenquiry)
        .update({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            altmobile: req.body.altmobile,
            address: req.body.address,
            status: req.body.status,
            gender: req.body.gender,
            loantype: req.body.applytype,
            createddate: req.body.createddate,
            // teleid: req.body.teleid,
            // adminid: req.body.adminid,
            comment: req.body.comment,
            updateddate: localTime,
            turnover: req.body.turnover

        })
        .then(function(result) {
            //console.log(result); 
            res.json('Enquiry update Successfully');
        })
});
router.get('/enquirycount1', (req, res) => {

    knex.select()
        .from('enquirydata')
        .then(function(result) {
            console.log(result.length);
            res.json(result.length);
        })
});


router.get('/getEnquirylistexe/:pagesize/:page/:id', (req, res, next) => {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1));
    // console.log(req.params.id);

    knex.select('enquirydata.*', 'loantype.loantype', 'employee.name as ename')
        .from('enquirydata')
        .join('loantype', 'loantype.idloantype', 'enquirydata.loantype')
        .join('employee', 'employee.idemployee', 'enquirydata.teleid')
        .where('enquirydata.executiveid', req.params.id)
        .limit(pageSize).offset(skip)
        .then(function(result) {
            // console.log(res);
            knex.select()
                .from('enquirydata')
                .join('loantype', 'loantype.idloantype', 'enquirydata.loantype')
                .join('employee', 'employee.idemployee', 'enquirydata.teleid')
                .where('enquirydata.executiveid', req.params.id)
                .then(function(re) {

                    res.status(200).json({
                        message: "Memberlists fetched",
                        posts: result,
                        maxPosts: re.length
                    });
                })
        })
});
router.get('/enquirycount2/:obj', (req, res) => {

    knex.select()
        .from('enquirydata')
        .where('executiveid', req.params.obj)
        .then(function(result) {
            console.log(result.length);
            res.json(result.length);
        })
});
router.get('/viewroutine/:pagesize/:page/:id', (req, res, next) => {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1));
    console.log(req.params.id);
    knex.select('daily_routine.*', 'bank.bankname')
        .from('daily_routine')
        .join('bank', 'bank.idbank', 'daily_routine.bankid')
        .where('employeeid', req.params.id)
        .limit(pageSize).offset(skip)
        .then(function(result) {

            knex.select('daily_routine.*', 'bank.bankname')
                .from('daily_routine')
                .join('bank', 'bank.idbank', 'daily_routine.bankid')
                .where('employeeid', req.params.id)
                .then(function(re) {

                    res.status(200).json({
                        message: "Memberlists fetched",
                        posts: result,
                        maxPosts: re.length
                    });
                })
        })
});
router.get('/editdata1/:id', function(req, res) {
    knex.select('daily_routine.*', 'bank.bankname', 'bank.idbank')
        .from('daily_routine')
        .join('bank', 'bank.idbank', 'daily_routine.bankid')
        .where('routineid', req.params.id)
        .then(function(result) {
            console.log(result);
            res.json(result);
        })
});
router.post('/editroutine', (req, res) => {
    const nowdate = format.asString('yyyy-MM-dd', new Date());
    console.log(req.body);
    knex('daily_routine')
        .where('routineid', req.body.routineid)
        .update({
            companyname: req.body.companyname,
            bankid: req.body.bankid,
            whosecase: req.body.whosecase,
            status: req.body.status,
            // employeeid: req.params.empid,
            updateddate: nowdate,
            comment: req.body.comment
        })
        .then(function(result) {
            res.json('daily_routine update Successfully');
        })
});
router.get('/dataentrypiechart', function(req, res) {
    knex.select('status.status')
        .from('status')
        .count('status.statusid as total')
        // .join('employee', 'employee.iduser', 'usertype.idusertype')
        // .where('employee.status', 'active')
        .groupBy('status.status')
        .then(function(result) {
            res.json(result);
        })
});
router.get('/getbankrejectlist/:pagesize/:page/:id', function(req, res) {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1))
    var subquery = knex.select().from('status').max('status.statusid').groupBy('status.addbankid');
    knex.select('applybank.*', 'bank.*', 'customer.*', 'loantype.*', 'status.*', 'status.status as sstatus', 'status.createddate as screateddate',
            'loantype.loantype', 'applybank.reject_reason as areject_reason', 'applybank.amount as aamount')
        .from('applybank', 'customer')
        .join('bank', 'bank.idbank', 'applybank.idbank')
        .join('customer', 'applybank.idcustomer', 'customer.idcustomer')
        // .join('loantype', 'loantype.idloantype', 'customer.applytype')
        .join('status', 'status.addbankid', 'applybank.idapplybank')
        .join('loantype', 'applybank.idloan', 'loantype.idloantype')
        .whereIn('status.statusid', subquery)
        .where('applybank.idcustomer', req.params.id)
        // knex.select('customer.*', 'applybank.*', 'bank.*', 'loantype.*', 'applybank.status as astatus')
        //     .from('applybank', 'customer')
        //     .join('customer', 'applybank.idcustomer', 'customer.idcustomer')
        //     .join('bank', 'bank.idbank', 'applybank.idbank')
        //     .join('loantype', 'loantype.idloantype', 'customer.applytype')
        //     .where({ 'applybank.idcustomer': req.params.id })
        .limit(pageSize).offset(skip)
        .then(function(result) {
            // console.log(result);
            knex.select()
                .from('applybank', 'customer')
                .join('bank', 'bank.idbank', 'applybank.idbank')
                .join('customer', 'applybank.idcustomer', 'customer.idcustomer')
                // .join('loantype', 'loantype.idloantype', 'customer.applytype')
                .join('status', 'status.addbankid', 'applybank.idapplybank')
                .join('loantype', 'applybank.idloan', 'loantype.idloantype')
                .whereIn('status.statusid', subquery)
                .where('applybank.idcustomer', req.params.id)
                .then(function(re) {
                    var a = re.length
                        // console.log(a);
                    res.status(200).json({
                        message: "Memberlists fetched",
                        posts: result,
                        maxPosts: re.length
                    });
                })
        })
});
router.get('/approvalmember/:obj/:obj1', function(req, res) {
    // console.log(req.params.obj);
    // console.log(req.params.obj1);
    var date3 = format.asString('yyyy-MM-dd', new Date());
    knex('applybank')
        .where({ idapplybank: req.params.obj1 })
        .update({
            status: "APPROVED",
            amount: req.params.obj,
            updateddate: moment().format(date3)
        }).then(function(result) {
            // console.log(result); 
            res.json('Approved custome Successfully');
        })
});
router.get('/casecount/:obj', (req, res) => {

    knex.select()
        .from('customer', 'applybank')
        .join('applybank', 'applybank.idcustomer', 'customer.idcustomer')
        .where('customer.status', 'APPROVED')
        .where('applybank.executiveid', req.params.obj)
        .then(function(result) {
            console.log(result.length);
            res.json(result.length);
        })
});
router.get('/topupcount/:obj', (req, res) => {
    var subquery = knex.select().from('status').max('status.statusid').groupBy('status.addbankid');
    knex.select('applybank.*', 'bank.bankname', 'bank.bankvendor', 'status.*', 'status.status as sstatus', 'loantype.loantype')
        .from('applybank')
        .join('bank', 'bank.idbank', 'applybank.idbank')
        .join('status', 'status.addbankid', 'applybank.idapplybank')
        .join('loantype', 'applybank.idloan', 'loantype.idloantype')
        .whereIn('status.statusid', subquery)
        .where('applybank.status', 'ACTIVE')
        .where('applybank.executiveid', req.params.obj)
        .then(function(result) {
            res.json(result.length);
        })
        // knex.select()
        //     .from('applybank')
        //     .join('customer', 'customer.idcustomer', 'applybank.idcustomer')
        //     .join('employee', 'employee.idemployee', 'customer.idexecutive')
        //     .join('topup', 'topup.idtopup', 'applybank.idtopup')
        //     .join('bank', 'bank.idbank', 'applybank.idbank')
        //     .where('customer.status', 'disburse')
        //     .where('customer.topupstatus', 'topup')
        //     .where('customer.idexecutive', req.params.obj)
        //     .then(function (result) {
        //         console.log(result.length);
        //         res.json(result.length);
        //     })
});
router.post('/custdocument', (req, res) => {
    console.log(req.body);
    var companykyc;
    var comp_orgname;
    var customerkyc;
    var cust_orgname;
    var itr;
    var itr_orgname;
    var bankstatement;
    var bank_orgname;
    var loanstatement;
    var loan_orgname;
    var gstandreturns;
    var gst_orgname;
    var status;
    var displaystatus;
    // console.log(file)
    const nowdate = format.asString('yyyy-MM-dd', new Date());
    if (req.body.companykyc == undefined) {
        companykyc = 'admin.png';
        comp_orgname = 'admin.png';

    } else {
        companykyc = req.body.companykyc[0].blobName;
        comp_orgname = req.body.companykyc[0].originalname;
        console.log("company kyc BlobName  " + companykyc);
        console.log("comp orginal name  " + comp_orgname);
    }
    if (req.body.customerkyc == undefined) {
        customerkyc = 'admin.png';
        cust_orgname = 'admin.png';

    } else {
        customerkyc = req.body.customerkyc[0].blobName;
        cust_orgname = req.body.customerkyc[0].originalname;
        console.log("cust kyc BlobName  " + customerkyc);
        console.log("cudt orginal name  " + cust_orgname);
    }
    if (req.body.itr == undefined) {
        itr = 'admin.png';
        itr_orgname = 'admin.png';

    } else {
        itr = req.body.itr[0].blobName;
        itr_orgname = req.body.itr[0].originalname;
        console.log("itr BlobName  " + itr);
        console.log("itr orginal name  " + itr_orgname);
    }
    if (req.body.bankstatement == undefined) {
        bankstatement = 'admin.png';
        bank_orgname = 'admin.png';

    } else {
        bankstatement = req.body.bankstatement[0].blobName;
        bank_orgname = req.body.bankstatement[0].originalname;
        console.log("bankstatement BlobName  " + bankstatement);
        console.log("bankstatement orginal name  " + bank_orgname);
    }
    if (req.body.loanstatement == undefined) {
        loanstatement = 'admin.png';
        loan_orgname = 'admin.png';

    } else {
        loanstatement = req.body.loanstatement[0].blobName;
        loan_orgname = req.body.loanstatement[0].originalname;
        console.log("loanstatement BlobName  " + loanstatement);
        console.log("loanstatement orginal name  " + loan_orgname);
    }
    if (req.body.gstandreturns == undefined) {
        gstandreturns = 'admin.png';
        gst_orgname = 'admin.png';

    } else {
        gstandreturns = req.body.gstandreturns[0].blobName;
        gst_orgname = req.body.gstandreturns[0].originalname;
        console.log("gstandreturns BlobName  " + gstandreturns);
        console.log("gstandreturns orginal name  " + gst_orgname);
    }
    if (req.body.value.displaystatus != 'APPROVED') {
        displaystatus = "PENDING"
        status = "PENDING"
    } else {
        displaystatus = "APPROVED"
        status = "APPROVED"
    }
    knex('customer')
        .insert({
            cname: req.body.value.companyname,
            name: req.body.value.customername,
            whosecase: req.body.value.whosecase,
            idexecutive: req.body.abc[0],
            displaystatus: displaystatus,
            companykyc: companykyc,
            companykyc_orgname: comp_orgname,
            customerkyc: customerkyc,
            customerkyc_orgname: cust_orgname,
            itr: itr,
            itr_orgname: itr_orgname,
            bankstatement: bankstatement,
            bankstatement_orgname: bank_orgname,
            gstandreturns: gstandreturns,
            gstandreturns_orgname: gst_orgname,
            loanstatement: loanstatement,
            loanstatement_orgname: loan_orgname,
            status: status,
            applieddate: nowdate,
            createdby: req.body.empid,
            comment: req.body.value.comment,
            mobile: req.body.value.mobile,
            aadharno: req.body.value.aadharno,
            panno: req.body.value.panno,
            createdbyname: req.body.empname,
            executivename: req.body.abc[1],
        })
        .then(function(result) {
            console.log(result);
            res.json('customer document Added Successfully');
        })

});

router.get('/getdocument/:pagesize/:page', function(req, res) {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1))


    knex.select('customer.*', 'employee.name as ename')
        .from('customer', 'employee')
        .join('employee', 'employee.idemployee', 'customer.idexecutive')
        .orderBy('customer.applieddate', 'desc')
        // .where({ 'createdby': req.params.exeid })
        .limit(pageSize).offset(skip)
        .then(function(result) {

            knex.select()
                .from('customer', 'employee')
                .join('employee', 'employee.idemployee', 'customer.idexecutive')
                .orderBy('customer.applieddate', 'desc')
                .then(function(re) {
                    var a = re.length
                    console.log(a);
                    res.status(200).json({
                        message: "Memberlists fetched",
                        posts: result,
                        maxPosts: re.length
                    });
                })
        })
});
router.get('/getdocument3/:pagesize/:page', function(req, res) {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1))
    knex.select('customer.*', 'employee.name as ename')
        .from('customer', 'employee')
        .join('employee', 'employee.idemployee', 'customer.idexecutive')
        .orderBy('customer.applieddate', 'desc')
        .where({ 'customer.status': "APPROVED" })
        .limit(pageSize).offset(skip)
        .then(function(result) {

            knex.select()
                .from('customer', 'employee')
                .join('employee', 'employee.idemployee', 'customer.idexecutive')
                .where({ 'customer.status': "APPROVED" })
                .orderBy('customer.applieddate', 'desc')
                .then(function(re) {
                    var a = re.length
                    console.log(a);
                    res.status(200).json({
                        message: "Memberlists fetched",
                        posts: result,
                        maxPosts: re.length
                    });
                })
        })

    // knex.select('backend_operator.*', 'employee.name as ename')
    //   .from('backend_operator', 'employee')
    //   .join('employee', 'employee.idemployee', 'backend_operator.executiveid')
    //   // .where({ 'createdby': req.params.exeid })
    //   .limit(pageSize).offset(skip)
    //   .then(function (result) {

    //     knex.select()
    //       .from('backend_operator', 'employee')
    //       .join('employee', 'employee.idemployee', 'backend_operator.executiveid')
    //       // .where({ 'createdby': req.params.exeid })
    //       .then(function (re) {
    //         var a = re.length
    //         console.log(a);
    //         res.status(200).json({
    //           message: "Memberlists fetched",
    //           posts: result,
    //           maxPosts: re.length
    //         });
    //       })
    //   })
});
router.get('/backendedit/:id', function(req, res) {
    knex.select()
        .from('customer')
        // .join('usertype', 'usertype.idusertype', 'employee.iduser')
        .where('customer.idcustomer', req.params.id)
        .then(function(result) {
            //console.log(result); 
            res.json(result);
        })
});
router.post('/editcustdoc', (req, res) => {

    const nowdate = format.asString('yyyy-MM-dd', new Date());
    var companykyc;
    var comp_orgname;
    var customerkyc;
    var cust_orgname;
    var itr;
    var itr_orgname;
    var bankstatement;
    var bank_orgname;
    var loanstatement;
    var loan_orgname;
    var gstandreturns;
    var gst_orgname;
    var status;
    var displaystatus;
    if (req.body.companykyc == undefined) {
        companykyc = req.body.value.companykyc;

    } else {
        companykyc = req.body.companykyc[0].blobName;
        comp_orgname = req.body.companykyc[0].originalname;
        console.log("company kyc BlobName  " + companykyc);
        console.log("comp orginal name  " + comp_orgname);
    }
    if (req.body.customerkyc == undefined) {
        customerkyc = req.body.value.customerkyc;

    } else {
        customerkyc = req.body.customerkyc[0].blobName;
        cust_orgname = req.body.customerkyc[0].originalname;
        console.log("cust kyc BlobName  " + customerkyc);
        console.log("cudt orginal name  " + cust_orgname);
    }
    if (req.body.itr == undefined) {
        itr = req.body.value.itr;

    } else {
        itr = req.body.itr[0].blobName;
        itr_orgname = req.body.itr[0].originalname;
        console.log("itr BlobName  " + itr);
        console.log("itr orginal name  " + itr_orgname);
    }
    if (req.body.bankstatement == undefined) {
        bankstatement = req.body.value.bankstatement;

    } else {
        bankstatement = req.body.bankstatement[0].blobName;
        bank_orgname = req.body.bankstatement[0].originalname;
        console.log("bankstatement BlobName  " + bankstatement);
        console.log("bankstatement orginal name  " + bank_orgname);
    }
    if (req.body.loanstatement == undefined) {
        loanstatement = req.body.value.loanstatement;

    } else {
        loanstatement = req.body.loanstatement[0].blobName;
        loan_orgname = req.body.loanstatement[0].originalname;
        console.log("loanstatement BlobName  " + loanstatement);
        console.log("loanstatement orginal name  " + loan_orgname);
    }
    if (req.body.gstandreturns == undefined) {
        gstandreturns = req.body.value.gstandreturns;

    } else {
        gstandreturns = req.body.gstandreturns[0].blobName;
        gst_orgname = req.body.gstandreturns[0].originalname;
        console.log("gstandreturns BlobName  " + gstandreturns);
        console.log("gstandreturns orginal name  " + gst_orgname);
    }
    if (req.body.value.displaystatus != 'APPROVED') {
        displaystatus = "PENDING"
        status = "PENDING"
    } else {
        displaystatus = "APPROVED"
        status = "APPROVED"
    }
    knex('customer')
        .update({
            cname: req.body.value.companyname,
            name: req.body.value.customername,
            whosecase: req.body.value.whosecase,
            idexecutive: req.body.value.idexecutive,
            displaystatus: displaystatus,
            companykyc: companykyc,
            companykyc_orgname: comp_orgname,
            customerkyc: customerkyc,
            customerkyc_orgname: cust_orgname,
            itr: itr,
            itr_orgname: itr_orgname,
            bankstatement: bankstatement,
            bankstatement_orgname: bank_orgname,
            gstandreturns: gstandreturns,
            gstandreturns_orgname: gst_orgname,
            loanstatement: loanstatement,
            loanstatement_orgname: loan_orgname,
            status: status,
            applieddate: nowdate,
            createdby: req.body.empid,
            comment: req.body.value.comment,
            mobile: req.body.value.mobile,
            aadharno: req.body.value.aadharno,
            panno: req.body.value.panno,
            createdbyname: req.body.empname,
        })
        .where('idcustomer', req.body.custid)
        .then(function(result) {
            //console.log(result); 
            res.json('customer document Updated Successfully');
        })

});
router.post('/backendbankinsert', (req, res) => {
    const vbs = req.body.arr;
    const nowdate = format.asString('yyyy-MM-dd', new Date());
    for (var j = 0; j < vbs.length; j++) {
        // var backendid = vbs[j].loanid
        var bankid = vbs[j].bankid
        var vendor = vbs[j].vendor
        var amount = vbs[j].amount
        var status = vbs[j].status
        var product = vbs[j].product
        var executiveid = vbs[j].executiveid
        var executivename = vbs[j].executivename
        var idloan = vbs[j].loanid

        knex('applybank')
            .insert({
                idbank: bankid,
                amount: amount,
                idcustomer: req.body.idvalue,
                createdby: req.body.empid,
                status: status,
                product: product,
                createddate: nowdate,
                vendor: vendor,
                executiveid: executiveid,
                executivename: executivename,
                createdbyname: req.body.createdbyname,
                idloan: idloan,
            })
            // .returning('id')
            .then(function(id) {
                const ids = id.toString();
                const createddate = format.asString('yyyy-MM-dd', new Date());
                knex('status')
                    .insert({
                        addbankid: ids,
                        createddate: createddate,
                        status: status
                    }).then(function(re) {

                    })
            })
    }
    res.json("hi");
});
router.get('/getdocument1/:pagesize/:page/:obj', function(req, res) {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1))
    if (req.params.obj == 'Login Head') {
        knex.select('customer.*')
            .from('customer')
            .where({ 'customer.status': "APPROVED" })
                        .orderBy('customer.applieddate', 'desc')

            .limit(pageSize).offset(skip)
            .then(function(result) {

                knex.select()
                    .from('customer')
                    .where({ 'customer.status': "APPROVED" })
                                .orderBy('customer.applieddate', 'desc')
                    .then(function(re) {
                        var a = re.length
                        console.log(a);
                        res.status(200).json({
                            message: "Memberlists fetched",
                            posts: result,
                            maxPosts: re.length
                        });
                    })
            })
    } else {
        knex.select('backend_operator.*', 'employee.name as ename', 'addbank.*')
            .from('backend_operator', 'employee')
            .join('employee', 'employee.idemployee', 'backend_operator.executiveid')
            .join('addbank', 'addbank.logincreadtedby', 'employee.idemployee')
            .where({ 'backend_operator.status': "APPROVED" })
            .where({ 'addbank.logincreadtedby': req.params.obj })
                        .orderBy('customer.applieddate', 'desc')

            .limit(pageSize).offset(skip)
            .then(function(result) {

                knex.select()
                    .from('backend_operator', 'employee')
                    .join('employee', 'employee.idemployee', 'backend_operator.executiveid')
                    .join('addbank', 'addbank.logincreadtedby', 'employee.idemployee')
                    .where({ 'backend_operator.status': "APPROVED" })
                    .where({ 'addbank.logincreadtedby': req.params.obj })
                                .orderBy('customer.applieddate', 'desc')

                    .then(function(re) {
                        var a = re.length
                        console.log(a);
                        res.status(200).json({
                            message: "Memberlists fetched",
                            posts: result,
                            maxPosts: re.length
                        });
                    })
            })
    }
});
router.get('/getbackendviewbanklist/:id', (req, res) => {
    // console.log(req.params);
    var subquery = knex.select().from('status').max('status.statusid').groupBy('status.addbankid');
    knex.select('applybank.*', 'bank.bankname', 'bank.bankvendor', 'status.*', 'status.status as sstatus', 'loantype.loantype')
        .from('applybank')
        .join('bank', 'bank.idbank', 'applybank.idbank')
        .join('status', 'status.addbankid', 'applybank.idapplybank')
        .join('loantype', 'applybank.idloan', 'loantype.idloantype')
        .whereIn('status.statusid', subquery)
        .where('applybank.idcustomer', req.params.id)
        .then(function(result) {
            res.json(result);
        })
});
router.post('/editstatus/:obj', function(req, res) {
    // console.log(req.params.obj);
    // console.log(req.params.obj1);
    var date3 = format.asString('yyyy-MM-dd', new Date());
    knex('status')
        // .where({addbankid: req.params.obj1 })
        .insert({
            status: req.body.sstatus,
            comment: req.body.comment,
            createddate: date3,
            addbankid: req.params.obj
        }).then(function(result) {
            console.log(result);
        })
});
router.get('/getloginexecutivelist', function(req, res) {
    knex.select()
        .from('employee')
        .join('usertype', 'usertype.idusertype', 'employee.iduser')
        .where('usertype.user ', 'LOGIN')
        .where('employee.status ', 'active')
        .then(function(result) {
            //console.log(result);
            res.json(result);
        })
});

router.post('/sentlogexe/:obj/:obj2', function(req, res) {
    // console.log(req.params.obj);
    // console.log(req.params.obj1);
    var date3 = format.asString('yyyy-MM-dd', new Date());
    var abc1 = req.body.loginexeid.split(",", 2);
    knex.select()
        .from('applybank')
        .where({ 'applybank.idapplybank': req.body.idapplybank })
        .update({
            loginexeid: abc1[0],
            loginexename: abc1[1],
            timing: req.body.timing,
            logincreadtedby: req.params.obj,
            logincreadtedbyname: req.params.obj2,
            logindate: date3,
            lstatus: "loginsent"
        }).then(function(result) {
            // console.log(result); 
            res.json('sent added Successfully');
        })
});
router.get('/sentexelogedit1/:id', function(req, res) {
    knex.select()
        .from('applybank')
        .where('idapplybank', req.params.id)
        .then(function(result) {
            console.log(result);
            res.json(result);
        })
});
router.get('/getloginlist/:pagesize/:page/:obj', function(req, res) {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1))

    if (req.params.obj == 'Login Head') {
        knex.select('customer.*', 'applybank.*', 'bank.*', 'applybank.status as astatus')
            .from('applybank')
            .join('bank', 'bank.idbank', 'applybank.idbank')
            .join('customer', 'applybank.idcustomer', 'customer.idcustomer')
            .where({ 'applybank.lstatus': "loginsent" })
            .limit(pageSize).offset(skip)
            .then(function(result) {

                knex.select()
                    .from('applybank')
                    .join('bank', 'bank.idbank', 'applybank.idbank')
                    .join('customer', 'applybank.idcustomer', 'customer.idcustomer')
                    .where({ 'applybank.lstatus': "loginsent" })
                    .then(function(re) {
                        var a = re.length
                        console.log(a);
                        res.status(200).json({
                            message: "Memberlists fetched",
                            posts: result,
                            maxPosts: re.length
                        });
                    })
            })
    } else {
        knex.select('customer.*', 'applybank.*', 'bank.*', 'applybank.status as astatus')
            .from('applybank')
            .join('bank', 'bank.idbank', 'applybank.idbank')
            .join('customer', 'applybank.idcustomer', 'customer.idcustomer')
            .where({ 'applybank.lstatus': "loginsent" })
            .where({ 'applybank.logincreadtedby': req.params.obj })
            .limit(pageSize).offset(skip)
            .then(function(result) {

                knex.select()
                    .from('applybank')
                    .join('bank', 'bank.idbank', 'applybank.idbank')
                    .join('customer', 'applybank.idcustomer', 'customer.idcustomer')
                    .where({ 'applybank.lstatus': "loginsent" })
                    .where({ 'applybank.logincreadtedby': req.params.obj })
                    .then(function(re) {
                        var a = re.length
                        console.log(a);
                        res.status(200).json({
                            message: "Memberlists fetched",
                            posts: result,
                            maxPosts: re.length
                        });
                    })
            })
    }
});

router.post('/addloginroutine', (req, res) => {
    const vbs = req.body.arr;
    const nowdate = format.asString('yyyy-MM-dd', new Date());
    for (var j = 0; j < vbs.length; j++) {
        // var backendid = vbs[j].loanid
        var companyname = vbs[j].companyname
        var bankid = vbs[j].bankid
        var status = vbs[j].status
        var whosecase = vbs[j].whosecase
        var handover = vbs[j].handover
        var timings = vbs[j].timings
        knex('daily_routine')
            .insert({
                bankid: bankid,
                companyname: companyname,
                whosecase: whosecase,
                employeeid: req.body.idvalue,
                status: status,
                handover: handover,
                timings: timings,
                createddate: nowdate
            }).then(function(result) {
                console.log(result);
            })
    }
});
router.post('/editloginroutine/:empid', (req, res) => {
    const nowdate = format.asString('yyyy-MM-dd', new Date());
    console.log(req.body);
    knex('daily_routine')
        .where('routineid', req.body.routineid)
        .update({
            companyname: req.body.companyname,
            bankid: req.body.bankid,
            whosecase: req.body.whosecase,
            status: req.body.status,
            employeeid: req.params.empid,
            updateddate: nowdate,
            handover: req.body.handover,
            timings: req.body.timings
        })
        .then(function(result) {
            res.json('daily_routine update Successfully');
        })
});
router.post('/checkcustomer', function(req, res) {
    console.log(req.body);
    knex.select()
        .from('customer').where(function() {
            this.where({ aadharno: req.body.checkno })
                .orWhere({ panno: req.body.checkno })
                .orWhere({ mobile: req.body.checkno })
        })
        // .where({ aadharno: req.body.aadharno })
        // .orWhere({panno:req.body.aadharno})
        // .orWhere({mobile:req.aadharno})
        .then(function(result) {

            res.json(result);

        })
})
router.get('/logincount/:obj', (req, res) => {
    // console.log(req.body.obj)
    if (req.params.obj == 'Login Head') {
        knex.select()
            .from('applybank')
            .where('lstatus', "loginsent")
            .then(function(result) {
                console.log(result.length);
                res.json(result.length);
            })
    } else {
        res.json(0)
    }
});
router.get('/completlist/:pagesize/:page', function(req, res) {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1))
    knex.select('customer.*', 'loantype.loantype')
        .from('customer')
        .join('loantype', 'loantype.idloantype', 'customer.applytype')
        // .join('employee', 'employee.idemployee', 'customer.idexecutive')

    // .where({ 'customer.status': 'reject' })
    .limit(pageSize).offset(skip)
        .then(function(result) {

            knex.select()
                .from('customer')
                .join('loantype', 'loantype.idloantype', 'customer.applytype')
                // .join('employee', 'employee.idemployee', 'customer.idexecutive')

            // .where({ 'customer.status': 'reject' })
            .then(function(re) {
                var a = re.length
                console.log(a);
                res.status(200).json({
                    message: "Memberlists fetched",
                    posts: result,
                    maxPosts: re.length
                });
            })
        })
});
router.get('/https://bank.mindfin.co.in/:pagesize/:page/:sdate/:edate', (req, res, next) => {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1));
    const sdate = format.asString('yyyy-MM-dd', new Date(req.params.sdate));
    const edate = format.asString('yyyy-MM-dd', new Date(req.params.edate));
    knex.select('enquirydata.*', 'loantype.loantype', 'employee.name as empname', 'employee.branch')
        .from('enquirydata')
        .join('loantype', 'loantype.idloantype', 'enquirydata.loantype')
        .join('employee', 'employee.idemployee', 'enquirydata.teleid')
        .where('enquirydata.createddate', '>=', sdate)
        .where('enquirydata.createddate', '<=', edate)
        .orderBy('enquirydata.createddate', 'desc')
        .limit(pageSize).offset(skip)
        .then(function(result) {
            knex.select()
                .from('enquirydata')
                .join('loantype', 'loantype.idloantype', 'enquirydata.loantype')
                .join('employee', 'employee.idemployee', 'enquirydata.teleid')
                .where('enquirydata.createddate', '>=', sdate)
                .where('enquirydata.createddate', '<=', edate)
                .orderBy('enquirydata.createddate', 'desc')
                .then(function(re) {
                    res.status(200).json({
                        message: "Memberlists fetched",
                        posts: result,
                        maxPosts: re.length
                    });
                })
        })
});

router.get('/getBackendlist/:pagesize/:page/:sdate/:edate', (req, res, next) => {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1));
    const sdate = format.asString('yyyy-MM-dd', new Date(req.params.sdate));
    const edate = format.asString('yyyy-MM-dd', new Date(req.params.edate));
    knex.select('applybank.*', 'bank.bankname', 'customer.*', 'status.*', 'customer.createdbyname as ccreatedbyname',
            'status.createddate as acreateddate', 'status.status as astatus', 'applybank.amount as aamount',
            'status.comment as scomment', 'applybank.executivename as aexecutivename', 'applybank.createdbyname as acreatedbyname')
        .from('applybank', 'customer', 'status')
        .join('bank', 'bank.idbank', 'applybank.idbank')
        .join('status', 'status.addbankid', 'applybank.idapplybank')
        .join('customer', 'customer.idcustomer', 'applybank.idcustomer')
        .where('status.createddate', '>=', sdate)
        .where('status.createddate', '<=', edate)
        .orderBy('status.createddate', 'desc')

    .limit(pageSize).offset(skip)
        .then(function(result) {
            knex.select()
                .from('applybank', 'customer', 'status')
                .join('bank', 'bank.idbank', 'applybank.idbank')
                .join('status', 'status.addbankid', 'applybank.idapplybank')
                .join('customer', 'customer.idcustomer', 'applybank.idcustomer')
                .where('status.createddate', '>=', sdate)
                .where('status.createddate', '<=', edate)
                .orderBy('status.createddate', 'desc')
                .then(function(re) {
                    res.status(200).json({
                        message: "Memberlists fetched",
                        posts: result,
                        maxPosts: re.length
                    });
                })
        })
});
router.get('/getLoginreportlist/:pagesize/:page/:sdate/:edate', (req, res, next) => {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1));
    const sdate = format.asString('yyyy-MM-dd', new Date(req.params.sdate));
    const edate = format.asString('yyyy-MM-dd', new Date(req.params.edate));
    console.log(sdate);
    console.log(edate);
    knex.select('customer.*', 'applybank.*', 'bank.*',
            'applybank.status as astatus', 'applybank.executivename as aexecutivename')
        .from('applybank', 'customer')
        // .join('employee', 'employee.idemployee', 'backend_operator.executiveid')
        .join('customer', 'applybank.idcustomer', 'customer.idcustomer')
        // .join('employee', 'employee.idemployee', 'applybank.loginexeid')
        .join('bank', 'bank.idbank', 'applybank.idbank')
        .where({ 'applybank.lstatus': 'loginsent' })
        .where('applybank.logindate', '>=', sdate)
        .where('applybank.logindate', '<=', edate)
        .orderBy('applybank.logindate', 'desc')
        .limit(pageSize).offset(skip)
        .then(function(result) {
            knex.select()
                .from('applybank', 'customer')
                // .join('employee', 'employee.idemployee', 'backend_operator.executiveid')
                // .join('employee', 'employee.idemployee', 'applybank.loginexeid')
                .join('bank', 'bank.idbank', 'applybank.idbank')
                .join('customer', 'applybank.idcustomer', 'customer.idcustomer')
                .where({ 'applybank.lstatus': 'loginsent' })
                .where('applybank.logindate', '>=', sdate)
                .where('applybank.logindate', '<=', edate)
                .orderBy('applybank.logindate', 'desc')
                .then(function(re) {
                    res.status(200).json({
                        message: "Memberlists fetched",
                        posts: result,
                        maxPosts: re.length
                    });
                })
        })
});
router.get('/getLoginroutinelist/:pagesize/:page/:sdate/:edate', (req, res, next) => {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1));
    const sdate = format.asString('yyyy-MM-dd', new Date(req.params.sdate));
    const edate = format.asString('yyyy-MM-dd', new Date(req.params.edate));
    knex.select('daily_routine.*', 'bank.bankname', 'bank.bankvendor', 'employee.*', 'employee.name as empname', 'usertype.*', 'daily_routine.createddate as dcreateddate', 'daily_routine.status as dstatus')
        .from('daily_routine', 'employee')
        .join('bank', 'bank.idbank', 'daily_routine.bankid')
        .join('employee', 'employee.idemployee', 'daily_routine.employeeid')
        .join('usertype', 'usertype.idusertype', 'employee.iduser')
        .where('usertype.user', 'LOGIN')
        .where('daily_routine.createddate', '>=', sdate)
        .where('daily_routine.createddate', '<=', edate)
        .orderBy('daily_routine.createddate', 'desc')
        .limit(pageSize).offset(skip)
        .then(function(result) {
            knex.select()
                .from('daily_routine', 'employee')
                .join('bank', 'bank.idbank', 'daily_routine.bankid')
                .join('employee', 'employee.idemployee', 'daily_routine.employeeid')
                .join('usertype', 'usertype.idusertype', 'employee.iduser')
                .where('usertype.user', 'LOGIN')
                .where('daily_routine.createddate', '>=', sdate)
                .where('daily_routine.createddate', '<=', edate)
                .orderBy('daily_routine.createddate', 'desc')
                .then(function(re) {
                    res.status(200).json({
                        message: "Memberlists fetched",
                        posts: result,
                        maxPosts: re.length
                    });
                })
        })
});
router.get('/getExecutiveroutinelist/:pagesize/:page/:sdate/:edate', (req, res, next) => {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1));
    const sdate = format.asString('yyyy-MM-dd', new Date(req.params.sdate));
    const edate = format.asString('yyyy-MM-dd', new Date(req.params.edate));
    knex.select('daily_routine.*', 'bank.bankname', 'employee.*', 'employee.name as empname', 'usertype.*', 'daily_routine.createddate as dcreateddate', 'daily_routine.status as dstatus')
        .from('daily_routine', 'employee')
        .join('bank', 'bank.idbank', 'daily_routine.bankid')
        .join('employee', 'employee.idemployee', 'daily_routine.employeeid')
        .join('usertype', 'usertype.idusertype', 'employee.iduser')
        .where('usertype.user', 'EXECUTIVE')
        .where('daily_routine.createddate', '>=', sdate)
        .where('daily_routine.createddate', '<=', edate)
        .orderBy('daily_routine.createddate', 'desc')
        .limit(pageSize).offset(skip)
        .then(function(result) {
            knex.select()
                .from('daily_routine', 'employee')
                .join('bank', 'bank.idbank', 'daily_routine.bankid')
                .join('employee', 'employee.idemployee', 'daily_routine.employeeid')
                .join('usertype', 'usertype.idusertype', 'employee.iduser')
                .where('usertype.user', 'EXECUTIVE')
                .where('daily_routine.createddate', '>=', sdate)
                .where('daily_routine.createddate', '<=', edate)
                .orderBy('daily_routine.createddate', 'desc')
                .then(function(re) {
                    res.status(200).json({
                        message: "Memberlists fetched",
                        posts: result,
                        maxPosts: re.length
                    });
                })
        })
});
router.get('/getDataentryReportlist/:pagesize/:page/:sdate/:edate', (req, res, next) => {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1));
    const sdate = format.asString('yyyy-MM-dd', new Date(req.params.sdate));
    const edate = format.asString('yyyy-MM-dd', new Date(req.params.edate));
    var subquery = knex.select().from('status').max('status.statusid').groupBy('status.addbankid');
    knex.select('customer.*', 'bank.bankname', 'bank.bankvendor', 'applybank.*', 'status.createddate as screateddate',
            'status.status as bstatus', 'status.*', 'applybank.executivename as aexecutivename',
            'applybank.amount as bamount', 'applybank.reject_reason as brejectreason',
            'customer.name as custname')
        .from('customer')
        .join('applybank', 'applybank.idcustomer', 'customer.idcustomer')
        .join('status', 'status.addbankid', 'applybank.idapplybank')
        .join('bank', 'bank.idbank', 'applybank.idbank')
        .whereIn('status.statusid', subquery)
        .where('customer.editdate', '>=', sdate)
        .where('customer.editdate', '<=', edate)
        .orderBy('customer.editdate', 'desc')
        .limit(pageSize).offset(skip)
        .then(function(result) {
            knex.select()
                .from('customer')
                .join('applybank', 'applybank.idcustomer', 'customer.idcustomer')
                .join('status', 'status.addbankid', 'applybank.idapplybank')
                .join('bank', 'bank.idbank', 'applybank.idbank')
                .whereIn('status.statusid', subquery)
                .where('customer.editdate', '>=', sdate)
                .where('customer.editdate', '<=', edate)
                .orderBy('customer.editdate', 'desc')
                .then(function(re) {
                    res.status(200).json({
                        message: "Memberlists fetched",
                        posts: result,
                        maxPosts: re.length
                    });
                })
        })
});
router.get('/geEnquiryDatalist/:pagesize/:page/:sdate/:exeid', (req, res, next) => {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1));
    const sdate = format.asString('yyyy-MM-dd', new Date(req.params.sdate));
    knex.select('enquirydata.*', 'loantype.loantype', 'employee.name as ename', 'employee.branch')
        .from('enquirydata')
        .join('loantype', 'loantype.idloantype', 'enquirydata.loantype')
        .join('employee', 'employee.idemployee', 'enquirydata.teleid')
        .where('enquirydata.createddate', sdate)
        .where('executiveid', req.params.exeid)
        .orderBy('enquirydata.createddate', 'desc')
        .limit(pageSize).offset(skip)
        .then(function(result) {
            knex.select()
                .from('enquirydata')
                .join('loantype', 'loantype.idloantype', 'enquirydata.loantype')
                .join('employee', 'employee.idemployee', 'enquirydata.teleid')
                .where('enquirydata.createddate', sdate)
                .where('executiveid', req.params.exeid)
                .orderBy('enquirydata.createddate', 'desc')
                .then(function(re) {
                    res.status(200).json({
                        message: "Memberlists fetched",
                        posts: result,
                        maxPosts: re.length
                    });
                })
        })
});
router.get('/casedoccount', (req, res) => {
    knex.select()
        .from('customer')
        .where('customer.status', "APPROVED")
        .then(function(result) {
            res.json(result.length);
        })
});
router.get('/caselogin', (req, res) => {
    knex.select()
        .from('status')
        .where('status.status', "LOGIN")
        .then(function(result) {
            res.json(result.length);
        })
});
router.get('/casepd', (req, res) => {
    knex.select()
        .from('status')
        .where('status.status', "PD")
        .then(function(result) {
            res.json(result.length);
        })
});
router.get('/caseapproval', (req, res) => {
    knex.select()
        .from('status')
        .where('status.status', "APPROVED")
        .then(function(result) {
            res.json(result.length);
        })
});
router.get('/casereject', (req, res) => {
    knex.select()
        .from('status')
        .where('status.status', "REJECT")
        .then(function(result) {
            res.json(result.length);
        })
});
router.get('/casedisburse', (req, res) => {
    knex.select()
        .from('status')
        .where('status.status', "DISBURSED")
        .then(function(result) {
            res.json(result.length);
        })
});
router.get('/casewip', (req, res) => {
    knex.select()
        .from('status')
        .where('status.status', "WORK IN PROGRESS")
        .then(function(result) {
            res.json(result.length);
        })
});
router.get('/getdocument2/:pagesize/:page/:sdate/:obj', function(req, res) {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1))
    const sdate = format.asString('yyyy-MM-dd', new Date(req.params.sdate));
    if (req.params.obj == 'Login Head') {
        knex.select()
            .from('customer')
            .where('customer.applieddate', sdate)
            .where({ 'customer.status': "APPROVED" })
            .limit(pageSize).offset(skip)
            .then(function(result) {

                knex.select()
                    .from('customer')
                    .where('customer.applieddate', sdate)
                    .where({ 'customer.status': "APPROVED" })
                    .then(function(re) {
                        var a = re.length
                        console.log(a);
                        res.status(200).json({
                            message: "Memberlists fetched",
                            posts: result,
                            maxPosts: re.length
                        });
                    })
            })
    } else {
        knex.select()
            .from('customer')
            .where('customer.applieddate', sdate)
            .where({ 'customer.status': "APPROVED" })
            .where({ 'addbank.logincreadtedby': req.params.obj })
            .limit(pageSize).offset(skip)
            .then(function(result) {

                knex.select()
                    .from('customer')
                    .where('customer.applieddate', sdate)
                    .where({ 'customer.status': "APPROVED" })
                    .where({ 'addbank.logincreadtedby': req.params.obj })
                    .then(function(re) {
                        var a = re.length
                        console.log(a);
                        res.status(200).json({
                            message: "Memberlists fetched",
                            posts: result,
                            maxPosts: re.length
                        });
                    })
            })
    }
});
router.get('/getloginlist1/:pagesize/:page/:sdate/:obj', function(req, res) {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1))
    const sdate = format.asString('yyyy-MM-dd', new Date(req.params.sdate));
    if (req.params.obj == 'Login Head') {
        knex.select('customer.*', 'applybank.*', 'bank.*', 'applybank.status as astatus')
            .from('applybank')
            .join('bank', 'bank.idbank', 'applybank.idbank')
            .join('customer', 'applybank.idcustomer', 'customer.idcustomer')
            .where({ 'applybank.lstatus': "loginsent" })
            .where('applybank.logindate', sdate)
            .orderBy('applybank.logindate', 'desc')
            .limit(pageSize).offset(skip)
            .then(function(result) {

                knex.select()
                    .from('addbank')
                    .from('applybank')
                    .join('bank', 'bank.idbank', 'applybank.idbank')
                    .join('customer', 'applybank.idcustomer', 'customer.idcustomer')
                    .where({ 'applybank.lstatus': "loginsent" })
                    .where('applybank.logindate', sdate)
                    .orderBy('applybank.logindate', 'desc')
                    .then(function(re) {
                        var a = re.length
                        console.log(a);
                        res.status(200).json({
                            message: "Memberlists fetched",
                            posts: result,
                            maxPosts: re.length
                        });
                    })
            })
    } else {
        knex.select('customer.*', 'applybank.*', 'bank.*', 'applybank.status as astatus')
            .from('applybank')
            .join('bank', 'bank.idbank', 'applybank.idbank')
            .join('customer', 'applybank.idcustomer', 'customer.idcustomer')
            .where({ 'applybank.lstatus': "loginsent" })
            .where('applybank.logindate', sdate)
            .where({ 'addbank.logincreadtedby': req.params.obj })
            .limit(pageSize).offset(skip)
            .then(function(result) {

                knex.select()
                    .from('applybank')
                    .join('bank', 'bank.idbank', 'applybank.idbank')
                    .join('customer', 'applybank.idcustomer', 'customer.idcustomer')
                    .where({ 'applybank.lstatus': "loginsent" })
                    .where('applybank.logindate', sdate)
                    .where({ 'addbank.logincreadtedby': req.params.obj })
                    .then(function(re) {
                        var a = re.length
                        console.log(a);
                        res.status(200).json({
                            message: "Memberlists fetched",
                            posts: result,
                            maxPosts: re.length
                        });
                    })
            })
    }
});
router.post('/checkcase', function(req, res) {
    console.log(req.body);
    knex.select()
        .from('customer').where(function() {
            this.where({ aadharno: req.body.checkno })
                .orWhere({ panno: req.body.checkno })
                .orWhere({ mobile: req.body.checkno })
        })
        .then(function(result) {

            res.json(result);

        })
});
router.get('/getdocument4/:pagesize/:page/:sdate', function(req, res) {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1))
    const sdate = format.asString('yyyy-MM-dd', new Date(req.params.sdate));

    knex.select('customer.*', 'employee.name as ename')
        .from('customer', 'employee')
        .join('employee', 'employee.idemployee', 'customer.idexecutive')
        .where('customer.applieddate', sdate)
        .orderBy('customer.applieddate', 'desc')
        .limit(pageSize).offset(skip)
        .then(function(result) {

            knex.select()
                .from('customer', 'employee')
                .join('employee', 'employee.idemployee', 'customer.idexecutive')
                .where('customer.applieddate', sdate)
                .orderBy('customer.applieddate', 'desc')
                .then(function(re) {
                    var a = re.length
                    console.log(a);
                    res.status(200).json({
                        message: "Memberlists fetched",
                        posts: result,
                        maxPosts: re.length
                    });
                })
        })
});
router.get('/getdocument5/:pagesize/:page/:sdate', function(req, res) {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1))
    const sdate = format.asString('yyyy-MM-dd', new Date(req.params.sdate));
    knex.select('customer.*', 'employee.name as ename')
        .from('customer', 'employee')
        .join('employee', 'employee.idemployee', 'customer.idexecutive')

    .where({ 'customer.status': "APPROVED" })
        .where('customer.applieddate', sdate)
        .orderBy('customer.applieddate', 'desc')
        .limit(pageSize).offset(skip)
        .then(function(result) {

            knex.select()
                .from('customer', 'employee')
                .join('employee', 'employee.idemployee', 'customer.idexecutive')
                .where({ 'customer.status': "APPROVED" })
                .where('customer.applieddate', sdate)
                .orderBy('customer.applieddate', 'desc')
                .then(function(re) {
                    var a = re.length
                    console.log(a);
                    res.status(200).json({
                        message: "Memberlists fetched",
                        posts: result,
                        maxPosts: re.length
                    });
                })
        })
});
router.get('/getviewbanklistt/:id', (req, res) => {
    // console.log(req.params);
    // knex.select('applybank.*', 'bank.bankname', 'loantype.loantype')
    //     .from('applybank')
    //     .join('customer', 'customer.idcustomer', 'applybank.idcustomer')
    //     .join('bank', 'bank.idbank', 'applybank.idbank')
    //     .join('loantype', 'loantype.idloantype', 'applybank.idloan')
    //     .where('applybank.idcustomer', req.params.id)
    //     .where('applybank.status', 'APPROVED')
    var subquery = knex.select().from('status').max('status.statusid').groupBy('status.addbankid');
    knex.select('applybank.*', 'bank.bankname', 'bank.bankvendor', 'status.*', 'status.status as sstatus', 'status.createddate as screateddate', 'loantype.loantype')
        .from('applybank')
        .join('bank', 'bank.idbank', 'applybank.idbank')
        .join('status', 'status.addbankid', 'applybank.idapplybank')
        .join('loantype', 'applybank.idloan', 'loantype.idloantype')
        .whereIn('status.statusid', subquery)
        .where('applybank.idapplybank', req.params.id)

    .then(function(result) {
        res.json(result);
    })

})

router.get('/getcocustomer/:id', function(req, res) {
    knex.select()
        .from('co-customer')

    .where('idcustomer', req.params.id)
        .then(function(result) {
            //console.log(result); 
            res.json(result);
        })
})
router.post('/editcocust', (req, res, next) => {
    console.log(req.body);
    knex('co-customer')
        .where({ cocustomerid: req.body.cocustomerid })
        .update({
            coappname: req.body.coappname,
            coappresaddress: req.body.coappresaddress,
            coappperaddress: req.body.coappperaddress,
            idcustomer: req.body.idcustomer
        }).then(function(result) {
            res.json('co-customer updated Successfully');
        })
});
router.get('/getadminexecutivelist', function(req, res) {
    knex.select()
        .from('employee')
        .join('usertype', 'usertype.idusertype', 'employee.iduser')
        .where('usertype.user ', 'EXECUTIVE')
        .where('employee.designation', 'Admin')
        .where('employee.status ', 'active')
        .then(function(result) {
            //console.log(result);
            res.json(result);
        })
});
router.get('/getEnquirylistexe1/:pagesize/:page/:id', (req, res, next) => {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1));
    // console.log(req.params.id);

    knex.select('enquirydata.*', 'loantype.loantype', 'employee.name as ename')
        .from('enquirydata')
        .join('loantype', 'loantype.idloantype', 'enquirydata.loantype')
        .join('employee', 'employee.idemployee', 'enquirydata.teleid')
        .where('enquirydata.adminid', req.params.id)
        .orderBy('enquirydata.idenquiry', 'desc')
        .limit(pageSize).offset(skip)
        .then(function(result) {
            // console.log(res);
            knex.select()
                .from('enquirydata')
                .join('loantype', 'loantype.idloantype', 'enquirydata.loantype')
                .join('employee', 'employee.idemployee', 'enquirydata.teleid')
                .where('enquirydata.adminid', req.params.id)
                .orderBy('enquirydata.idenquiry', 'desc')
                .then(function(re) {

                    res.status(200).json({
                        message: "Memberlists fetched",
                        posts: result,
                        maxPosts: re.length
                    });
                })
        })
});
router.get('/teleeditData/:id', function(req, res) {
    knex.select('enquirydata.*', 'employee.idemployee as executive', 'enquirydata.createddate as enqdate', 'loantype.idloantype as applytype')
        .from('enquirydata')
        .join('employee', 'employee.idemployee', 'enquirydata.adminid')
        .join('loantype', 'loantype.idloantype', 'enquirydata.loantype')
        // .join('previousbankdetails','previousbankdetails.idcustomer','customer.idcustomer')
        .where('enquirydata.idenquiry', req.params.id)
        .then(function(result) {
            console.log(result);
            res.json(result);
        })
});
router.get('/https://bank.mindfin.co.in1/:pagesize/:page/:sdate/:edate/:eid', (req, res, next) => {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1));
    const sdate = format.asString('yyyy-MM-dd', new Date(req.params.sdate));
    const edate = format.asString('yyyy-MM-dd', new Date(req.params.edate));
    knex.select('enquirydata.*', 'loantype.loantype', 'employee.name as ename')
        .from('enquirydata')
        .join('loantype', 'loantype.idloantype', 'enquirydata.loantype')
        .join('employee', 'employee.idemployee', 'enquirydata.teleid')
        .where('enquirydata.adminid', req.params.eid)
        .orderBy('enquirydata.idenquiry', 'desc')
        .where('enquirydata.createddate', '>=', sdate)
        .where('enquirydata.createddate', '<=', edate)
        .limit(pageSize).offset(skip)
        .then(function(result) {
            knex.select()
                .from('enquirydata')
                .join('loantype', 'loantype.idloantype', 'enquirydata.loantype')
                .join('employee', 'employee.idemployee', 'enquirydata.teleid')
                .where('enquirydata.createddate', '>=', sdate)
                .where('enquirydata.createddate', '<=', edate)
                .where('enquirydata.adminid', req.params.eid)
                .orderBy('enquirydata.idenquiry', 'desc')

            .then(function(re) {
                res.status(200).json({
                    message: "Memberlists fetched",
                    posts: result,
                    maxPosts: re.length
                });
            })
        })
});
router.post('/assignexe', function(req, res) {
    // console.log(req.params.obj);
    // console.log(req.params.obj1);
    var abc = req.body.executive.split(",", 2);
    var date1 = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    var localTime = moment.utc(date1).toDate();
    knex('enquirydata')
        .where('idenquiry', req.body.idenquiry)
        .update({
            assignedTime: localTime,
            executiveid: abc[0],
            executivename: abc[1],
        }).then(function(result) {
            console.log(result);
        })
});
router.get('/getContactformlist/:pagesize/:page', (req, res, next) => {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1));
    console.log(req.params.id);

    knex.select()
        .from('website')
        .where('website.formtype', 'Contactform')
        .orderBy('website.applieddate', 'desc')
        .limit(pageSize).offset(skip)
        .then(function(result) {
            knex.select()
                .from('website')
                .where('website.formtype', 'Contactform')
                .orderBy('website.applieddate', 'desc')
                .then(function(re) {
                    res.status(200).json({
                        message: "Memberlists fetched",
                        posts: result,
                        maxPosts: re.length
                    });
                })
        })
});

router.get('/getcareerformlist/:pagesize/:page', (req, res, next) => {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1));
    console.log(req.params.id);

    knex.select()
        .from('website')
        .where('website.formtype', 'Careerform')
        .orderBy('website.applieddate', 'desc')
        .limit(pageSize).offset(skip)
        .then(function(result) {
            knex.select()
                .from('website')
                .where('website.formtype', 'Careerform')
                .orderBy('website.applieddate', 'desc')
                .then(function(re) {
                    res.status(200).json({
                        message: "Memberlists fetched",
                        posts: result,
                        maxPosts: re.length
                    });
                })
        })
});
router.get('/getCallbackformlist/:pagesize/:page', (req, res, next) => {
    const pageSize = req.params.pagesize;
    const currentPage = req.params.page;
    const skip = (pageSize * (currentPage - 1));
    console.log(req.params.id);

    knex.select()
        .from('website')
        .where('website.formtype', 'Callbackform')
        .orderBy('website.applieddate', 'desc')
        .limit(pageSize).offset(skip)
        .then(function(result) {
            knex.select()
                .from('website')
                .where('website.formtype', 'Callbackform')
                .orderBy('website.applieddate', 'desc')
                .then(function(re) {
                    res.status(200).json({
                        message: "Memberlists fetched",
                        posts: result,
                        maxPosts: re.length
                    });
                })
        })
});
// router.post('/image-upload', upload.fields([{ name: 'companykyc' }]), (req, res) => {


//     console.log(req.files);
//     // const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

//     // // Enter your storage account name and shared key
//     // const account = "mindfinfiles";
//     // const accountKey = "4NrEY0vfXnyvJVohjkXXcBLZDfYnCCUqO/HfnaTnhmiYAYxj0n9cbVRvheeNcvdEwJFnh4DhA1Uf7Uxbcq4ocw==";

//     // // Use StorageSharedKeyCredential with storage account and account key
//     // // StorageSharedKeyCredential is only avaiable in Node.js runtime, not in browsers
//     // const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
//     // const blobServiceClient = new BlobServiceClient(
//     //     `https://${account}.blob.core.windows.net`,
//     //     sharedKeyCredential
//     // )
//     // const containerName = "mindfin-backend";

//     // async function main() {
//     //     const containerClient = blobServiceClient.getContainerClient(containerName);

//     //     const content = "hello world";
//     //     const blobName = "newblob" + new Date().getTime();
//     //     const blockBlobClient = containerClient.getBlockBlobClient(blobName);
//     //     // const uploadBlobResponse = await blockBlobClient.uploadFile(req.file, {
//     //     //     // This should be called over the course of the upload but, instead,
//     //     //     // it is called lots of times up-front and not as the file uploads.
//     //     //     progress: (p) => console.log(`Uploaded ${p.loadedBytes} bytes`)
//     //     // })
//     //     // console.log(`Upload block blob ${blobName} successfully`, uploadBlobResponse.requestId);
//     // }

//     // main();
// });
router.post('/image-upload', upload.any(), (req, res) => {
    console.log(req.files)

    // res.json(req.files.blobName)
    return res.json({ 'imageUrl': req.files });
});
router.post('/addemployee', (req, res) => {
    console.log(req.body);
    var password = generator.generate({
        length: 8,
        numbers: true
    });
    var dob = req.body.value.dob;
    const nowdate1 = format.asString('yyyy-MM-dd', new Date(dob));
    const nowdate = format.asString('yyyy-MM-dd', new Date());
    const doj = req.body.value.joiningdate;
    var cimage;
    var pimage;
    var aimage;
    console.log(doj);
    const nowdate2 = format.asString('yyyy-MM-dd', new Date(doj));
    const encryptedString = sha1(password);
    if (req.body.cimg == undefined) {
        cimage = 'admin.png';

    } else {
        cimage = req.body.cimg[0].blobName;
        console.log("BlobName  " + cimage);
    }
    if (req.body.pimg == undefined) {
        pimage = 'admin.png';

    } else {
        pimage = req.body.pimg[0].blobName;
        console.log(pimage);
    }
    if (req.body.aimg == undefined) {
        aimage = 'admin.png';
    } else {
        aimage = req.body.aimg[0].blobName;
        console.log(aimage);
    }

    knex('employee')
        .returning('id')
        .insert({
            name: req.body.value.name,
            mobile: req.body.value.mobile,
            email: req.body.value.email,
            dob: nowdate1,
            ifsc: req.body.value.ifsc,
            altmobile: req.body.value.altmobile,
            address: req.body.value.address,
            qualification: req.body.value.qualification,
            accno: req.body.value.accno,
            branch: req.body.value.branch,
            pincode: req.body.value.pincode,
            iduser: req.body.value.idusertype,
            gender: req.body.value.gender,
            cimage: cimage,
            pimage: pimage,
            aimage: aimage,
            status: 'active',
            password: encryptedString,
            orgpassword: password,
            joiningdate: nowdate2,
            createddate: nowdate,
            designation: req.body.value.designation,
            createdby: req.body.createdby

        })

    .then(function(result) {

        res.json('Employee Added Successfully');
        knex.select()
            .from('settings').where({ status: 'active' })
            .then(function(resu) {
                console.log(resu);
                console.log(resu[0].idsetting);
                console.log(resu[0].emailuser);
                var emailuser = resu[0].emailuser;
                var emailpassword = resu[0].emailpassword;
                var hostmail = resu[0].hostmail;
                var resubject = resu[0].subject;
                var bsubject = resu[0].bsubject;

                var mloginlink = resu[0].mloginlink;
                var fromemail1 = resu[0].fromemail1;
                var regards = resu[0].regards;
                var cc = resu[0].cc;
                var bcc = resu[0].bcc;
                var address = resu[0].address;
                // res.json(resu);
                const output = `<center style="width:100%;table-layout:fixed">
                <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#F5F7F8">
                    <tbody>
                        <tr>
                            <td>
                                <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#F5F7F8">
                                    <tbody>
                                        <tr>
                                            <td>
                                                <div
                                                    style="margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:0px;padding-right:0px">
                                                    <table align="center"
                                                        style="border-spacing:0;font-family:sans-serif;color:#f5f7f8;Margin:0 auto;width:100%"
                                                        bgcolor="#F5F7F8">
                                                        <tbody>
                                                            <tr>
                                                                <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0"
                                                                    bgcolor="#F5F7F8">
                                                                    <table width="100%"
                                                                        style="border-spacing:0;font-family:sans-serif;color:#f5f7f8"
                                                                        bgcolor="#F5F7F8">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td style="padding-bottom:0px;padding-top:0px;padding-left:20px;
                           padding-right:20px;background-color:#f5f7f8;color:#f5f7f8;width:100%;
                           font-size:1px;line-height:1px;text-align:left;display:none!important">
            
            
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
            
            
                                <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#F5F7F8">
                                    <tbody>
                                        <tr>
                                            <td style="padding-bottom:20px">
                                                <div
                                                    style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">
            
                                                    <table align="center"
                                                        style="border-spacing:0;font-family:sans-serif;color:#111111;Margin:0 auto;width:100%;max-width:600px"
                                                        bgcolor="#F5F7F8">
                                                        <tbody>
                                                            <tr>
                                                                <td bgcolor="#F5F7F8"
                                                                    style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
                                                                    <table width="73%"
                                                                        style="border-spacing:0;font-family:sans-serif;color:#111111"
                                                                        bgcolor="#F5F7F8">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0px"
                                                                                    width="109" height="103" alt="logo"
                                                                                    align="center">
                                                                                    <img style="display:block; line-height:0px; font-size:0px; 
                               border:0px;" src="https://dl2.pushbulletusercontent.com/CEyJvfyccHBYUunsWk8U99b6dkeV3s5Y/logo1.png"
                                                                                        width="150" height="100" alt="logo">
                                                                                </td>
                                                                            </tr>
            
                                                                        </tbody>
                                                                    </table>
                                                                </td>
            
                                                            </tr>
                                                        </tbody>
                                                    </table>
            
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
            
            
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
                                    <tbody>
                                        <tr>
                                            <td bgcolor="#F5F7F8"
                                                style="background-color:#f5f7f8;padding-top:0;padding-right:0;padding-left:0;padding-bottom:0">
                                                <div
                                                    style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">
                                                    <table bgcolor="#FFFFFF" width="100%" align="center" border="0" cellspacing="0"
                                                        cellpadding="0" style="font-family:sans-serif;color:#111111">
                                                        <tbody>
                                                            <tr>
                                                                <td bgcolor="#FFFFFF" align="center"
                                                                    style="word-break:break-all;padding-top:40px;padding-bottom:0;padding-right:40px;padding-left:40px;text-align:center;background-color:#ffffff;font-weight:bold;font-family:Arial,sans-serif,'Arial Bold','gdsherpa-bold';font-size:32px;line-height:42px"
                                                                    class="m_3203954183132274498h2mobile">
            
                                                                    <span>
                                                                        <a>Hi <b>` + req.body.name + `,</b><br />
                                                                        </a>
                                                                    </span>
            
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
            
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
            
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
                                    <tbody>
                                        <tr>
                                            <td bgcolor="#F5F7F8"
                                                style="background-color:#f5f7f8;padding-top:0;padding-right:0;padding-left:0;padding-bottom:0">
                                                <div
                                                    style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">
                                                    <table bgcolor="#FFFFFF" width="100%" align="center" border="0" cellspacing="0"
                                                        cellpadding="0" style="font-family:sans-serif;color:#111111">
                                                        <tbody>
                                                            <tr>
                                                                <td bgcolor="#FFFFFF" align="center"
                                                                    style="padding-top:15px;padding-bottom:0;padding-right:40px;padding-left:40px;text-align:center;background-color:#ffffff;font-weight:bold;font-family:Arial,sans-serif,'Arial Bold','gdsherpa-bold';font-size:21px;line-height:31px">
                                                                    <span><a>
                                                                            Please note your CRM credentials!!! .
                                                                        </a></span>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
            
                                    </tbody>
                                </table>
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
                                    <tbody>
                                        <tr>
                                            <td bgcolor="#F5F7F8" style="padding-top:0px;padding-bottom:0px">
                                                <div
                                                    style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">
            
                                                    <table bgcolor="#FFFFFF" align="center"
                                                        style="border-spacing:0;font-family:sans-serif;color:#111111;margin:0 auto;width:100%;max-width:600px">
                                                        <tbody>
                                                            <tr>
                                                                <td
                                                                    style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
                                                                    <table width="100%"
                                                                        style="border-spacing:0;font-family:sans-serif;color:#111111">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td
                                                                                    style="padding-top:40px;padding-bottom:0px;padding-left:40px;padding-right:40px;background-color:#ffffff;width:100%;text-align:left">
                                                                                    <p
                                                                                        style="margin-top:0px;line-height:0px;margin-bottom:0px;font-size:4px">
                                                                                        &nbsp;</p>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
                                    <tbody>
                                        <tr>
                                            <td bgcolor="#F5F7F8" style="padding-top:0px;padding-bottom:0px">
                                                <div
                                                    style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">
                                                    <table bgcolor="#1976D2" align="center"
                                                        style="border-spacing:0;font-family:sans-serif;color:#ffffff;margin:0 auto;width:100%;max-width:600px">
                                                        <tbody>
                                                            <tr>
                                                                <td
                                                                    style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
                                                                    <table width="100%"
                                                                        style="border-spacing:0;font-family:sans-serif;color:#ffffff">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td
                                                                                    style="padding-top:25px;padding-bottom:0px;padding-left:40px;padding-right:40px;background-color:#1976d2;width:100%;text-align:center">
                                                                                    <p class="m_3203954183132274498bodycopy"
                                                                                        style="font-family:Arial,sans-serif,'gdsherpa-regular';margin-top:0px;font-size:16px;line-height:26px;margin-bottom:0px">
                                                                                        YOUR PASSWORD:<b>` + password + `</b>,
                                                                                        <br />EMAILID:<b
                                                                                            style="font-family:Arial,sans-serif,'gdsherpa-regular';;color:#ffffff"
                                                                                            ;margin-top:0px;font-size:16px;line-height:26px;margin-bottom:0px">
                                                                                            ` + req.body.email + `</b>
                                                                                        <br />
                                                                                    </p>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td bgcolor="#F5F7F8" style="padding-top:0px;padding-bottom:0px">
                                                                    <div
                                                                        style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:0px;padding-right:0px">
            
                                                                        <table bgcolor="#FFFFFF" align="center"
                                                                            style="border-spacing:0;font-family:sans-serif;color:#111111;margin:0 auto;width:100%;max-width:600px">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td
                                                                                        style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0  ">
                                                                                        <table width="100%"
                                                                                            style="border-spacing:0;font-family:sans-serif;color:#111111">
                                                                                            <tbody>
                                                                                                <tr>
                                                                                                    <td
                                                                                                        style="padding-top:29px;font-size:23px;padding-bottom:0px;padding-left:40px;padding-right:40px;background-color:#ffffff;width:100%;text-align:center">
                                                                                                        <p style="font-size: 16px;">
                                                                                                            Click here to login <a
                                                                                                                href="` + mloginlink + `"
                                                                                                                style="color: blue">"` +
                    mloginlink +
                    `"</a><br />
                                                                                                            Login To Above Link
                                                                                                            <br />To Start Your
                                                                                                            Process.....</p>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                        </table>
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
                                    <tbody>
                                    </tbody>
                                </table>
            
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
                    <tbody>
                    </tbody>
                </table>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
                    <tbody>
                        <tr>
                            <td bgcolor="#F5F7F8" style="padding-top:0px;padding-bottom:0px">
                                <div
                                    style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">
            
                                    <table bgcolor="#FFFFFF" align="center"
                                        style="border-spacing:0;font-family:sans-serif;color:#111111;margin:0 auto;width:100%;max-width:600px">
                                        <tbody>
                                            <tr>
                                                <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
                                                    <table width="100%"
                                                        style="border-spacing:0;font-family:sans-serif;color:#111111;table-layout:fixed">
                                                        <tbody>
                                                            <tr>
                                                                <td
                                                                    style="padding-top:15px;padding-bottom:0px;padding-left:40px;padding-right:40px;background-color:#ffffff;width:100%;text-align:left;word-break:break-all">
                                                                    <p style="font-size:16px;"><b>Regards</b></p>
                                                                    <p style="font-size: 16px;">` + regards + `</p>
                                                                    <p style="font-size: 16px;">` + address + `</p>
                                                                    <br>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
            
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
                    <tbody>
                        <tr>
                            <td bgcolor="#F5F7F8" style="padding-top:0px;padding-right:0;padding-left:0;padding-bottom:0px">
                                <div
                                    style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">
            
                                    <table bgcolor="#FFFFFF" width="100%" align="center" border="0" cellspacing="0" cellpadding="0"
                                        style="font-family:sans-serif;color:#ffffff">
                                        <tbody>
                                            <tr>
                                                <td bgcolor="#FFFFFF" align="center"
                                                    style="padding-top:20px;padding-bottom:0;padding-right:40px;padding-left:40px;text-align:center">
                                                    <table border="0" cellpadding="0" cellspacing="0" align="center" width="100%">
                                                        <tbody>
                                                            <tr>
                                                                <td align="center"
                                                                    style="padding-top:0;padding-right:0;padding-bottom:0;padding-left:0">
                                                                    <table border="0" cellspacing="0" cellpadding="0"
                                                                        align="center">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td align="center"
                                                                                    style="font-size:18px;line-height:22px;font-weight:bold;font-family:Arial,sans-serif,'Arial Bold','gdsherpa-bold'">
                                                                                    <span>
                                                                                    </span></td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
                    <tbody>
                        <tr>
                            <td bgcolor="#F5F7F8" style="padding-top:0px;padding-bottom:0px">
                                <div
                                    style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">
            
                                    <table bgcolor="#FFFFFF" align="center"
                                        style="border-spacing:0;font-family:sans-serif;color:#111111;margin:0 auto;width:100%;max-width:600px">
                                        <tbody>
                                            <tr>
                                                <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
                                                    <table width="100%"
                                                        style="border-spacing:0;font-family:sans-serif;color:#111111">
                                                        <tbody>
                                                            <tr>
                                                                <td
                                                                    style="padding-top:15px;padding-bottom:0px;padding-left:40px;padding-right:40px;background-color:#ffffff;width:100%;text-align:left">
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
            
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
                    <tbody>
                        <tr>
                            <td bgcolor="#F5F7F8" style="padding-top:0px;padding-bottom:0px">
                                <div
                                    style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">
            
                                    <table bgcolor="#FFFFFF" align="center"
                                        style="border-spacing:0;font-family:sans-serif;color:#111111;margin:0 auto;width:100%;max-width:600px">
                                        <tbody>
                                            <tr>
                                                <td width="20" bgcolor="#FFFFFF"
                                                    style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0"><img
                                                        src="https://ci5.googleusercontent.com/proxy/RICSIZJJJakoeRjSl1leY13zGXyq9_HKIqrwFRrOPA57xyZdbs53L1rQ4yhCH11-SspdFH__fOZOY6Z2y9DifqeOMXwq3pGBzw-CBms=s0-d-e1-ft#https://imagesak.secureserver.net/promos/std/spc_trans.gif"
                                                        height="10" width="20" border="0" style="display:block;border-width:0"
                                                        class="CToWUd"></td>
                                                <td
                                                    style="padding-top:25px;padding-bottom:0px;padding-right:0;padding-left:0;text-align:center;font-size:0;background-color:#ffffff">
            
                                                    <div style="width:100%;max-width:560px;display:inline-block;vertical-align:top">
                                                        <table width="100%"
                                                            style="border-spacing:0;font-family:sans-serif;color:#111111">
                                                            <tbody>
                                                                <tr>
                                                                    <td
                                                                        style="padding-top:0px;padding-bottom:0px;padding-left:20px;padding-right:20px;background-color:#ffffff">
                                                                        <table
                                                                            style="border-spacing:0;font-family:sans-serif;color:#111111;width:100%;font-size:14px;text-align:left;background-color:#ffffff;border-left-color:#fedc45;border-left-style:solid;border-left-width:3px">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td
                                                                                        style="padding-top:0px;padding-bottom:0px;padding-left:20px;padding-right:20px;background-color:#ffffff;width:100%;text-align:left">
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
            
                                                </td>
                                                <td width="20" bgcolor="#FFFFFF"
                                                    style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0"><img
                                                        src="https://ci5.googleusercontent.com/proxy/RICSIZJJJakoeRjSl1leY13zGXyq9_HKIqrwFRrOPA57xyZdbs53L1rQ4yhCH11-SspdFH__fOZOY6Z2y9DifqeOMXwq3pGBzw-CBms=s0-d-e1-ft#https://imagesak.secureserver.net/promos/std/spc_trans.gif"
                                                        height="10" width="20" border="0" style="display:block;border-width:0"
                                                        class="CToWUd"></td>
                                            </tr>
                                        </tbody>
                                    </table>
            
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
                    <tbody>
                        <tr>
                            <td bgcolor="#F5F7F8" style="padding-top:0px;padding-bottom:0px">
                                <div
                                    style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">
            
                                    <table bgcolor="#FFFFFF" align="center"
                                        style="border-spacing:0;font-family:sans-serif;color:#111111;margin:0 auto;width:100%;max-width:600px">
                                        <tbody>
                                            <tr>
                                                <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
                                                    <table width="100%"
                                                        style="border-spacing:0;font-family:sans-serif;color:#111111">
                                                        <tbody>
                                                            <tr>
                                                                <td
                                                                    style="padding-top:40px;padding-bottom:0px;padding-left:40px;padding-right:40px;background-color:#ffffff;width:100%;text-align:left">
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
            
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5F7F8">
                    <tbody>
                        <tr>
                            <td bgcolor="#F5F7F8" style="padding-top:0px;padding-bottom:0px">
                                <div
                                    style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">
            
                                    <table align="center" style="border-spacing:0;Margin:0 auto;width:100%;max-width:600px">
                                        <tbody>
                                            <tr>
                                                <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
                                                    <table width="100%"
                                                        style="border-spacing:0;font-family:sans-serif;color:#ffffff">
                                                        <tbody>
                                                            <tr>
                                                                <td
                                                                    style="padding-top:40px;padding-bottom:0px;padding-left:40px;padding-right:40px;background-color:#f5f7f8;width:100%;text-align:left">
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#E8EAEB">
                    <tbody>
                        <tr>
                            <td bgcolor="#E8EAEB" style="padding-top:0px;padding-bottom:0px">
                                <div
                                    style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">
            
                                    <table align="center" style="border-spacing:0;Margin:0 auto;width:100%;max-width:600px">
                                        <tbody>
                                            <tr>
                                                <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
                                                    <table width="100%"
                                                        style="border-spacing:0;font-family:sans-serif;color:#ffffff">
                                                        <tbody>
                                                            <tr>
                                                                <td
                                                                    style="padding-top:40px;padding-bottom:0px;padding-left:40px;padding-right:40px;background-color:#e8eaeb;width:100%;text-align:left">
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#E8EAEB">
                    <tbody>
                        <tr>
                            <td bgcolor="#E8EAEB" style="padding-top:0px;padding-bottom:0px">
                                <div
                                    style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">
                                    <table align="center"
                                        style="border-spacing:0;font-family:sans-serif;color:#757575;margin:0 auto;width:100%;max-width:600px">
                                        <tbody>
                                            <tr>
                                                <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
                                                    <table width="100%"
                                                        style="border-spacing:0;font-family:sans-serif;color:#757575">
                                                        <tbody>
                                                            <tr>
                                                                <td
                                                                    style="padding-top:0px;padding-bottom:15px;padding-left:0px;padding-right:0px;background-color:#e8eaeb;width:100%;text-align:left">
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#E8EAEB">
                    <tbody>
                        <tr>
                            <td bgcolor="#E8EAEB" style="padding-top:0px;padding-bottom:0px">
                                <div
                                    style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">
                                    <table align="center"
                                        style="border-spacing:0;font-family:sans-serif;color:#757575;Margin:0 auto;width:100%;max-width:600px">
                                        <tbody>
                                            <tr>
                                                <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
                                                    <table width="100%"
                                                        style="border-spacing:0;font-family:sans-serif;color:#757575">
                                                        <tbody>
                                                            <tr>
                                                                <td
                                                                    style="padding-top:0px;padding-bottom:25px;padding-left:0px;padding-right:0px;background-color:#e8eaeb;width:100%;text-align:left">
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#E8EAEB">
                    <tbody>
                        <tr>
                            <td bgcolor="#E8EAEB" style="padding-top:0px;padding-bottom:0px">
                                <div
                                    style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;padding-left:20px;padding-right:20px">
                                    <table align="center"
                                        style="border-spacing:0;font-family:sans-serif;color:#757575;Margin:0 auto;width:100%;max-width:600px">
                                        <tbody>
                                            <tr>
                                                <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0">
                                                    <table width="100%"
                                                        style="border-spacing:0;font-family:sans-serif;color:#757575">
                                                        <tbody>
                                                            <tr>
                                                                <td
                                                                    style="padding-top:0px;padding-bottom:25px;padding-left:0px;padding-right:0px;background-color:#e8eaeb;width:100%;text-align:left">
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                </td>
                </tr>
                </tbody>
                </table>
            </center>`;

                let transporter = nodemailer.createTransport({
                    host: hostmail,
                    port: 587,
                    transportMethod: 'SMTP',
                    // secure: false, // true for 465, false for other ports
                    auth: {
                        user: emailuser, // gmail id
                        pass: emailpassword // gmail password
                    },
                    tls: {
                        rejectUnauthorized: false
                    }
                });
                // setup email data with unicode symbols
                let mailOptions = {
                    from: fromemail1,
                    to: req.body.email, // list of receivers
                    cc: cc,
                    bcc: bcc,
                    subject: bsubject, //"Project Payment Update From", // Subject line
                    text: 'Hello world?', // plain text body
                    html: output // html body
                };
                // send mail with defined transport object
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message sent: %s', info.messageId);
                    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                    res.render('contact', { msg: 'Email has been sent' });
                });


            })



    })

})

module.exports = router;