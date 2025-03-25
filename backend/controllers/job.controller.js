import { Job } from "../models/job.model.js";

const postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      experienceLevel,
      salary,
      location,
      jobType,
      position,
      company,
      application,
    } = req.body;
    if (
      !title ||
      !description ||
      !experienceLevel ||
      !salary ||
      !location ||
      !jobType ||
      !position ||
      !company
    ) {
      return res
        .status(400)
        .json({ message: "Enter all the required fields", success: false });
    }
    const job = await Job.create({
      title,
      description,
      requirements: requirements.split(","),
      salary: Number(salary),
      location,
      experienceLevel,
      jobType,
      position,
      company,
      created_By: req.id,
      application,
    });
    return res
      .status(200)
      .json({ message: "Job Created successfully", job, success: true });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Something went wrong", success: false });
  }
};

const getAllJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const query = {
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    };
    const jobs = await Job.find(query)
      .populate({ path: "company" })
      .sort({ createdAt: -1 });
    if (!jobs) {
      return res.status(404).json({ message: "No jobs found", success: false });
    }
    return res.status(200).json({ jobs, success: true });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Something went wrong", success: false });
  }
};

const getJobsByIdForUsers = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId)
      .populate({ path: "company" })
      .populate({ path: "created_By" })
      .populate({ path: "application" });

    if (!job) {
      return res.status(404).json({ message: "Job not found", success: false });
    }
    return res.status(200).json({ job, success: true });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Something went wrong", success: false });
  }
};

const getAdminCreatedJobs = async (req, res) => {
  try {
    const adminId = req.id;
    const jobs = await Job.find({ created_By: adminId })
      .populate("company", "name location website")
      .sort({ createdAt: -1 });

    if (!jobs) {
      return res
        .status(404)
        .json({ message: "Jobs not found", success: false });
    }
    return res.status(200).json({ jobs, success: true });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Something went wrong", success: false });
  }
};

const saveUnsaveJob = async (req, res) => {
  try {
    const { id } = req.body;
  } catch (err) {
    console.log(err);
  }
};
export {
  postJob,
  getAllJobs,
  getJobsByIdForUsers,
  getAdminCreatedJobs,
  saveUnsaveJob,
};
