import { Company } from "../models/company.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

const registerCompany = async (req, res) => {
  try {
    const { companyName } = req.body;
    if (!companyName) {
      return res
        .status(400)
        .json({ message: "Company name is required", success: false });
    }
    let company = await Company.findOne({ name: companyName });
    if (company) {
      return res
        .status(400)
        .json({ message: "Company name already registered", success: false });
    }
    company = await Company.create({ name: companyName, userId: req.id });
    return res.status(201).json({
      message: "Company registered successfully",
      company,
      success: true,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Something went wrong", success: false });
  }
};

const getUserAddedCompany = async (req, res) => {
  try {
    const userId = req.id; // logged in user id
    const companies = await Company.find({ userId });
    if (!companies) {
      return res
        .status(404)
        .json({ message: "Companies not found", success: false });
    }
    return res.status(200).json({ companies, success: true });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Something went wrong", success: false });
  }
};

const getCompanyById = async (req, res) => {
  try {
    const companyId = req.params.id;
    const company = await Company.findById(companyId);
    if (!company) {
      return res
        .status(404)
        .json({ message: "Company not found", success: false });
    }
    return res.status(200).json({ company, success: true });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Something went wrong", success: false });
  }
};

const updateCompany = async (req, res) => {
  try {
    const { name, description, website, location } = req.body;
    const file = req.file;

    //cloudinary
    let cloudResponse;
    if (file) {
      const fileUri = getDataUri(file);

      if (fileUri) {
        cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
          resource_type: "raw",
          public_id: file.originalname.split(".")[0],
          overwrite: true,
        });
      }
    }

    const updatedData = {};

    if (name) updatedData.name = req.body.name;
    if (description) updatedData.description = req.body.description;
    if (website) updatedData.website = req.body.website;
    if (location) updatedData.location = req.body.location;
    if (cloudResponse) {
      updatedData.logo = cloudResponse.secure_url;
    }

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      updatedData,

      { new: true }
    );
    if (!company) {
      return res
        .status(404)
        .json({ message: "Company not found", success: false });
    }
    return res
      .status(200)
      .json({ message: "Company imformation updated", success: true });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Something went wrong", err, success: false });
  }
};

export { registerCompany, getUserAddedCompany, getCompanyById, updateCompany };
