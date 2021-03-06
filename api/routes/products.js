 const express = require('express');
 const router = express.Router();
 const Product = require('../models/product');
 const mongoose= require('mongoose');
 const multer = require('multer');
 
 const storage= multer.diskStorage({
     destination: function (req,file,cb){
         cb(null, './upload/');
     },
     filename: function(req,file,cb){
         cb(null, new Date().toISOString() + file.originalname);
     }
 });
 
const upload = multer({storage: storage});
 router.get('/',(req,res,next)=> {
     Product.find()
     .select('name price _id productImage')
     .exec()
     .then(docs => {
         const response ={
             count: docs.length,
             products: docs.map(doc =>{
                 return {
                 name : doc.name,
                 price : doc.price,
                 _id: doc._id,
                 productImage: doc.productImage,
                 request: {
                     type: 'GET',
                     url :'http://localhost:3000/products/'+ doc._id
                 }
                }
             })
         }; 
         res.status(200).json(response);
     })
     .catch(err => {
        console.log(err);
        res.status(500).json({error:err});
     })
 });


 router.get('/:productId', (req, res, next) =>{
     const  id = req.params.productId;
     Product.findById(id)
     .select('name price _id productImage')
     .exec()
     .then(doc => {
         console.log("from Database " + doc);
        if(doc)  {
         res.status(200).json(doc);
     } else {
         res.status(404).json({
             message: "No valid entry found"
         });
        }
     }) 
     .catch(err => 
        {
            console.log(err);
            res.status(500).json({error:err});
        });

 });

 router.post('/', upload.single('productImage'),(req, res, next) =>{
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name:req.body.name,
        price:req.body.price
    });
    product.save()
    .then(result => {
        
       console.log(result);
        res.status(200).json({
            message: 'New product successfully created',
            createdProduct:{
                name : result.name,
                price: result.price,
                _id : result._id,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/'+result._id
                }
            
            }
        });
    })
    .catch(err => console.log(err));
}); 

router.delete('/:productId', (req,res,next)=>{
    const id= req.params.productId;

    Product.deleteOne({_id: id})
    .exec()
    .then(result => {
        res.status(200).json(result);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error:err});

    })

});
router.patch('/:productId',(req,res,next)=> {
    id = req.params.productId;
    const updateOps={};
    for (const ops of req.body){
        updateOps[ops.propName]= ops.value;
    }
    Product.updateOne({_id: id}, {$set:updateOps})
    .exec()
    .then(result => {
        console.log(result);
        res.status(200).json(result);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err})
    })
});


module.exports = router;


