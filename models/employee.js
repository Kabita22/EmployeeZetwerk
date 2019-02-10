const mongoose=require('mongoose');
const schema=mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);


var EmployeeSchema=new schema({
    _id:{ type: Number },
    name:{ type: String, required: true},
    dateOfBirth:{ type: Date, required: true},
    salary:{ type: Number, required: true},
    skills:{ type: [String], required: true},
    image:{ type: String, required: true},
}, { _id: false });

EmployeeSchema.plugin(AutoIncrement);

var employee=mongoose.model('employee', EmployeeSchema);

module.exports=employee;