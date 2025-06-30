import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";
import api from "../utils/axios.js";

const initialState = {
  user: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

export const login = createAsyncThunk("user/login", async (user, thunkAPI) => {
  try {
    const response = await axios.post(
      process.env.REACT_APP_API_URL + "api/auth/login",
      user
    );

    // Simpan token ke localStorage
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }

    // Return user object dari response
    return response.data.user;
  } catch (error) {
    if (error.response) {
      const message =
        error.response.data.message ||
        error.response.data.msg ||
        "Terjadi kesalahan saat login";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    } else {
      const message = "Terjadi kesalahan koneksi";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
});

export const getMe = createAsyncThunk("user/getMe", async (_, thunkAPI) => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.get(
      process.env.REACT_APP_API_URL + "api/auth/me",
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // console.log(response.data.user);

    // Return user object dari response
    return response.data.user;
  } catch (error) {
    if (error.response) {
      const message =
        error.response.data.message ||
        error.response.data.msg ||
        "Terjadi kesalahan";
      // toast.error(message);
      return thunkAPI.rejectWithValue(message);
    } else {
      const message = "Terjadi kesalahan koneksi";
      // toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
});

export const LogOut = createAsyncThunk("user/LogOut", async (_, thunkAPI) => {
  // Hapus data dari localStorage terlebih dahulu untuk kecepatan
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  try {
    await axios.delete(process.env.REACT_APP_API_URL + "api/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
  }

  // Return null untuk mengatur user state menjadi null
  return null;
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
      state.message = "";
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.user = action.payload;
      state.message = "";
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload;
    });

    // Get User Login
    builder.addCase(getMe.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
      state.message = "";
    });
    builder.addCase(getMe.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.user = action.payload;
      state.message = "";
    });
    builder.addCase(getMe.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload;
    });

    // Logout
    builder.addCase(LogOut.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(LogOut.fulfilled, (state, action) => {
      state.user = null;
      state.isSuccess = false;
      state.isError = false;
      state.isLoading = false;
      state.message = "";
    });
    builder.addCase(LogOut.rejected, (state) => {
      state.user = null;
      state.isSuccess = false;
      state.isError = false;
      state.isLoading = false;
      state.message = "";
    });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
