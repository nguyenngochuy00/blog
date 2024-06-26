import { configureStore } from '@reduxjs/toolkit'
import blogReducer from 'pages/blog/blog.slice'
import { useDispatch } from 'react-redux'

export const store = configureStore({
  reducer: { blog: blogReducer }
})

// Lấy RootState và AppDispatch từ store để phục vụ vấn đề typescript
export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

// Dùng useAppDispatch khi dispatch async thunk
// Dùng useDispatch khi dispatch action
export const useAppDispatch = () => useDispatch<AppDispatch>()
