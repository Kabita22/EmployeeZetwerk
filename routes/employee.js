const express = require('express');
var app=express();
const router = express.Router();
const employee=require('../models/employee');
const database=require('../config/config');
const multer=require('multer'); 

//create a storage for images 
const storage=multer.diskStorage({
  destination:function(req,res,callback){
    callback(null, 'public/images');
  },
  filename: function(req,file,callback){
    callback(null, file.originalname);
  }
});

//filters the type of file uploaded by user for image
const fileFilter=function(req,file,callback){
  if(file.mimetype === 'image/jpeg' || file.mimetype ==='image/png' ){
    callback(null,true);
  }
  else{
    var error=new Error("Please provide file in jpg or png format");
    error.code=130;
    callback(error,false);
  }
}

//initialize multer
const upload=multer({storage: storage, fileFilter: fileFilter}); 

//GET all employees
router.get('/allEmployees', (req,res,next)=>{
      employee.
        find((err, employees)=>{
            if(err){
              var error=new Error("Failed to fetch data");
              error.code=500;
              next(error);
            }
            else if(employees.length == 0){
              var error=new Error("No data available");
              error.code=404;
              next(error);
            }
            else{
              res.send({
                code: 200,
                message: "Data fetch successful",
                Employees: employees
              });
            }
      });
});

//GET employee with the provided id
router.get('/employee/:id', (req,res,next)=>{
    id=req.params.id;
    console.log("id"+id);
    if(id == null){
      var error=new Error("Provide an employee id");
      error.code=400;
      next(error);
    }
    else{
      employee.
        findById(id,(err, employee)=>{
          if(employee == null || employee.length == 0){
            var error= new Error("User not found");
            error.code=401;
            next(error);
          }
          else{
            res.send({
              code: 200,
              message: "Data fetch successful",
              Employees: employee
            });
          }
        });
    }
});

//GET all employees with the provided skill
router.get('/employeeSkill/:skill', (req,res,next)=>{
  reqSkill=req.params.skill;
  if(reqSkill == null){
    var error=new Error("Provide a skill");
    error.code=400;
    next(error);
  }
  else{
    employee.
      find({skills: reqSkill},(err, employee)=>{
        if(employee == null || employee.length == 0){
          var error= new Error("User not found");
          error.code=401;
          next(error);
        }
        else{
          res.send({
            code: 200,
            message: "Data fetch successful",
            Employees: employee
          });
        }
      });
  }
});

//Insert employee details in the database
router.post('/employee', upload.single('image') , (req,res,next)=>{
    request=req.body;
    if(!request.name || !request.dateOfBirth || !request.salary ||
        !request.skills || !req.file.path){
          var error=new Error("Please enter all the details!");
          error.code=400;
          next(error);
    }
    else if(request.skills.length> 10){      
        var error=new Error("You can add upto 10 skills");
        error.code=400;
        next(error);
    }
    else{
      var employeeObj=new employee({
        name: request.name,
        dateOfBirth: request.dateOfBirth,
        salary: request.salary,
        skills: request.skills,
        image: req.file.path
      });
      employeeObj.
        save((err)=>{
            if(err){
              var error=new Error("Server Error");
              error.code=400;
              next(error);
            }
            else{
              res.send({
                code:200,
                message: "successfully added Employee details"
              });
            }
      });
    }
});

//Update employee details by id-- provide all the details of the employee along with the id
router.put('/employeeUpdateById', upload.single('image') , (req,res,next)=>{
    request= req.body;
    if(!request.name || !request.dateOfBirth || !request.salary ||
      !request.skills || !req.file){
        var error=new Error("Please provide all the details!");
        error.code=400;
        next(error);
    }
    if(request.skills.length> 10){      
      var error=new Error("You can add upto 10 skills");
      error.code=400;
      next(error);
    }
    employee.
      findByIdAndUpdate(request.id,
        {$set:{name: request.name}, dateOfBirth: request.dateOfBirth, 
        salary: request.salary, skills: request.skills, image: req.file.path},(err)=>{
        if(err){
          var error=new Error("Unable to update");
          error.code=400;
          next(error);
        }
        else{
          res.send({
            code:200,
            message: "successfully updated Employee details"
          });
        }
    });
});

//Add a new skill for an employee--Give id and skills in request body
router.put('/employeeSkills', (req,res,next)=>{
  request= req.body;
  if(!request.id || !request.skills){
    var error=new Error("Please enter all the details!");
    error.code=400;
    next(error);
  }
  else if(request.skills.length > 10){
    var error=new Error("You can add upto 10 skills");
    error.code=400;
    next(error);
  }
  else{
    employee.
      findByIdAndUpdate(request.id,{$addToSet:{skills: request.skills}},(err)=>{
        if(err){
          var error=new Error("Unable to update");
          error.code=400;
          next(error);
        }
        else{
          res.send({
            code:200,
            message: "successfully updated Employee skills"
          });
        }
    });
  }  
});

//Delete an employee with the provided id
router.delete('/employeeById/:id', (req, res,next)=>{
    id= req.params.id;
    if(id == null){
      var error=new Error("Provide an employee id");
      error.code=400;
      next(error);
    }
    employee.
      findByIdAndRemove(id,(err, emp)=>{
        if(emp == null){
          var error=new Error("Employee not found");
          error.code=400;
          next(error);
        }
        else if(err){
          var error=new Error("Server error");
          error.code=400;
          next(error);
        }
        else{
          res.send({
            code: 200,
            message: "Deleted Successfully",
            Employee: emp
          });
        }
      });
});

//Remove a skill from the employee's skills set
router.put('/employeeSkillDelete', (req,res,next)=>{
    request=req.body;
    if(!request.id || !request.skills){
      var error=new Error("Provide valid details");
      error.code=400;
      next(error);
    }
    else{
      employee.
        findByIdAndUpdate(request.id,{$pull:{skills: request.skills}},(err, skills)=>{
            if(err){
              var error=new Error("Server error");
              error.code=400;
              next(error);
            }
            else{
              res.send({
                code: 200,
                message: "Deleted Successfully",
                Employee: skills
              });
            }
        });
    }
});



module.exports = router;
