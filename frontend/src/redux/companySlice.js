import { createSlice } from "@reduxjs/toolkit";

const companySlice = createSlice({
  name: "company",
  initialState: {
    singleCompany: null,
    allAdminCompanies: [],
  },
  reducers: {
    setSingleCompany: (state, action) => {
      state.singleCompany = action.payload;
    },
    setAllAdminCompanies: (state, action) => {
      state.allAdminCompanies = action.payload;
    },
  },
});

export const { setSingleCompany, setAllAdminCompanies } = companySlice.actions;

export default companySlice.reducer;
