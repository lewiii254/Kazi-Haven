import { setAppliedJobs } from "@/redux/applicationSlice";
import { APPLICATION_BASE_URL } from "@/utils/constant";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetAppliedJobs = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchAllAppliedJobs = async () => {
      try {
        const res = await axios.get(`${APPLICATION_BASE_URL}/get`, {
          withCredentials: true,
        });
        console.log(res);

        if (res.data.success) {
          dispatch(setAppliedJobs(res.data.application));
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchAllAppliedJobs();
  }, []);
};

export default useGetAppliedJobs;
