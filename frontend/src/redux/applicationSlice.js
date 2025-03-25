import { createSlice } from "@reduxjs/toolkit";

const applicationSlice = createSlice({
  name: "appplication",
  initialState: {
    appliedJobs: [],
  },
  reducers: {
    setAppliedJobs: (state, action) => {
      state.appliedJobs = action.payload;
    },
  },
});

export const { setAppliedJobs } = applicationSlice.actions;

export default applicationSlice.reducer;
