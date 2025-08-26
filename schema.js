const Joi=require("joi");
module.exports.listingSchema=Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description:Joi.string().required(),
        location:Joi.string().required(),
        country:Joi.string().required(),
        price:Joi.number().required(),
        image: Joi.object({
  url: Joi.string().allow("").uri()
}).required()

    }).required(),
});

module.exports.reviewSchema=Joi.object({
    review:Joi.object({
          rating:Joi.number().min(1).max(5).required(),
          comment:Joi.string().required(),
        //   author:Joi.string().required(),
    }).required(),
});