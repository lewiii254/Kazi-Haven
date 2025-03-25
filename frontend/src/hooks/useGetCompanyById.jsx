import { setSingleCompany } from "@/redux/companySlice";
import { COMPANY_BASE_URL } from "@/utils/constant";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetCompanyById = (companyId) => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchCompanyById = async () => {
      try {
        const res = await axios.get(`${COMPANY_BASE_URL}/get/${companyId}`, {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setSingleCompany(res.data.company));
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchCompanyById();
  }, [companyId, dispatch]);
};

export default useGetCompanyById;
