import Yup from "yup";

const formSchema = Yup.object({
    username: Yup.string()
        .required("Username required")
        .min(6, "Username too short")
        .max(28, "Username too long!"),
    password: Yup.string()
        .required("Password requiredx")
        .min(6, "Password too short")
        .max(28, "Password too long!"),
});



const validateForm = (req, res) => {
    const formData = req.body;
    console.log(`formData = ${formData} req = ${req}`);
    formSchema
        .validate(formData)
        .catch(err => {
            res.status(422).send()
            console.log(err.errors);
        }).then(valid => {
            // res.status(200).send()
            if (valid) { 
                console.log("form is good") 
            }
        });
}

export default validateForm;
