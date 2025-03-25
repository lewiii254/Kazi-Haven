import { setAllAdminCompanies } from "@/redux/companySlice";
import { COMPANY_BASE_URL } from "@/utils/constant";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetAllAdminCompanies = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchAllAdminCompanies = async () => {
      try {
        const res = await axios.get(`${COMPANY_BASE_URL}/get`, {
          withCredentials: true,
        });

        if (res.data.success) {
          dispatch(setAllAdminCompanies(res.data.companies));
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchAllAdminCompanies();
  }, []);
};

export default useGetAllAdminCompanies;
