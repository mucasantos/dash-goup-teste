import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import Cookies from 'js-cookie'
import { User } from '@/lib/redux/services/authApi'

interface AuthState {
  user: User | null
  redirectToLogin: boolean
  token_goup: string | null
  goup_nicename: string | null
  goup_display_name: string | null
}

const initialState: AuthState = {
  user: null,
  redirectToLogin: false,
  token_goup: null,
  goup_nicename: null,
  goup_display_name: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User
        token: string
        token_goup: string
        goup_nicename: string
        goup_display_name: string
      }>
    ) => {
      state.user = action.payload.user
      state.token_goup = action.payload.token_goup
      state.goup_nicename = action.payload.goup_nicename
      state.goup_display_name = action.payload.goup_display_name
      state.redirectToLogin = false
      
      try {
        Cookies.set('token', action.payload.token)
        
        const userToStore = {
          id: action.payload.user?.id,
          name: action.payload.user?.name,
          email: action.payload.user?.email,
          role: action.payload.user?.role,
          id_empresa: action.payload.user?.id_empresa
        };
        
        const userJson = JSON.stringify(userToStore);
        
        Cookies.set('test_cookie', 'test_value', { expires: 7 });
        
        Cookies.set('user', userJson, { expires: 7, secure: false, sameSite: 'lax' });
        
        Cookies.set('token_goup', action.payload.token_goup, { expires: 7, secure: true, sameSite: 'lax' })
        Cookies.set('goup_nicename', action.payload.goup_nicename, { expires: 7, secure: true, sameSite: 'lax' })
        Cookies.set('goup_display_name', action.payload.goup_display_name, { expires: 7, secure: true, sameSite: 'lax' })
        
        try {
          localStorage.setItem('user_data', userJson);
        } catch (localStorageError) {
        }
      } catch (error) {
      }
    },
    logout: (state) => {
      state.user = null
      state.token_goup = null
      state.goup_nicename = null
      state.goup_display_name = null
      state.redirectToLogin = true
      
      Cookies.remove('token')
      Cookies.remove('user')
      Cookies.remove('token_goup')
      Cookies.remove('goup_nicename')
      Cookies.remove('goup_display_name')
    },
    rehydrateAuth: (state) => {
      const token = Cookies.get('token')
      const userString = Cookies.get('user')
      const token_goup = Cookies.get('token_goup')
      const goup_nicename = Cookies.get('goup_nicename')
      const goup_display_name = Cookies.get('goup_display_name')
      
      let localStorageUser = null;
      if (typeof window !== "undefined") {
        localStorageUser = localStorage.getItem('user_data');
      }
      
      const finalUserString = userString || localStorageUser;
      
      if (token && finalUserString) {
        try {
          const parsedUser = JSON.parse(finalUserString);
          
          state.user = parsedUser
          
          if (token_goup && goup_nicename && goup_display_name) {
            state.token_goup = token_goup
            state.goup_nicename = goup_nicename
            state.goup_display_name = goup_display_name
          }
          
          state.redirectToLogin = false
        } catch (error) {
          state.redirectToLogin = true;
        }
      } else {
        state.redirectToLogin = true
      }
    },
    redirectToLogin: (state) => {
      state.redirectToLogin = true
    },
  },
})

export const { setCredentials, logout, rehydrateAuth, redirectToLogin } = authSlice.actions
export default authSlice.reducer
