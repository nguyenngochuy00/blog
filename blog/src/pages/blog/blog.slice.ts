import { AsyncThunk, PayloadAction, createAsyncThunk, createSlice, current } from '@reduxjs/toolkit'
import { Post } from 'types/blog.type'
import http from 'utils/http'

// AsyncThunk là 1 kiểu generic (tổng quát)
// Tham số đầu tiên là kiểu của giá trị trả về khi hành động hoàn thành
// Tham số thứ hai là kiểu của tham số mà hành động nhận vào.
// Tham số thứ ba là kiểu của đối tượng tùy chọn cho cấu hình bổ sung (thường là thunkAPI).
type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>
// pending là một hàm trong GenericAsyncThunk đại diện cho hành động khi một async thunk đang được thực thi.
// Kiểu PendingAction này sẽ đại diện cho hành động khi async thunk ở trạng thái pending.
type PendingAction = ReturnType<GenericAsyncThunk['pending']>
type RejectedAction = ReturnType<GenericAsyncThunk['rejected']>
type FulfilledAction = ReturnType<GenericAsyncThunk['fulfilled']>

interface BlogState {
  postList: Post[]
  editingPost: Post | null
  loading: boolean
}

const initialState: BlogState = {
  // postList: initialPostList,
  postList: [],
  editingPost: null,
  loading: false
}

// createAsyncThunk nhận vào (action, async callback)
// Dùng createAsyncThunk ở extraReducers, dùng ở reducers sẽ genarate ra action (ko cần thiết)
// _ : khi ko khai báo gì
export const getPostList = createAsyncThunk('blog/getPostList', async (_, thunkAPI) => {
  const response = await http.get<Post[]>('posts', {
    signal: thunkAPI.signal
  })
  return response.data
})

export const addPost = createAsyncThunk('blog/addPost', async (body: Omit<Post, 'id'>, thunkAPI) => {
  const response = await http.post<Post>('posts', body, {
    signal: thunkAPI.signal
  })
  return response.data
})

export const updatePost = createAsyncThunk(
  'blog/updatePost',
  async ({ postId, body }: { postId: string; body: Post }, thunkAPI) => {
    const response = await http.put<Post>(`posts/${postId}`, body, {
      signal: thunkAPI.signal
    })
    return response.data
  }
)

export const deletePost = createAsyncThunk('blog/deletePost', async (postId: string, thunkAPI) => {
  const response = await http.delete<Post>(`posts/${postId}`, {
    signal: thunkAPI.signal
  })
  return response.data
})

// export const addPost = createAction('blog/addPost', function (post: Omit<Post, 'id'>) {
//   return {
//     payload: {
//       ...post,
//       id: nanoid()
//     }
//   }
// })
// export const addPost = createAction<Post>('blog/addPost')
// export const deletePost = createAction<string>('blog/deletePost')
// export const startEditingPost = createAction<string>('blog/startEditingPost')
// export const cancelEditingPost = createAction('blog/cancelEditingPost')
// export const finishEditingPost = createAction<Post>('blog/finishEditingPost')

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    // deletePost: (state, action: PayloadAction<string>) => {
    //   const postId = action.payload
    //   const foundPostIndex = state.postList.findIndex((post) => post.id === postId)
    //   if (foundPostIndex !== -1) {
    //     state.postList.splice(foundPostIndex, 1)
    //   }
    // },
    startEditingPost: (state, action: PayloadAction<string>) => {
      const postId = action.payload
      const foundPost = state.postList.find((post) => post.id === postId) || null
      state.editingPost = foundPost
    },
    cancelEditingPost: (state) => {
      state.editingPost = null
    }
    // finishEditingPost: (state, action: PayloadAction<Post>) => {
    //   const postId = action.payload.id
    //   state.postList.some((post, index) => {
    //     if ((post.id = postId)) {
    //       state.postList[index] = action.payload
    //       return true
    //     }
    //     return false
    //   })
    //   state.editingPost = null
    // }
    // addPost: {
    //   reducer: (state, action: PayloadAction<Post>) => {
    //     const post = action.payload
    //     state.postList.push(post)
    //   },
    //   prepare: (post: Omit<Post, 'id'>) => {
    //     return {
    //       payload: {
    //         ...post,
    //         id: nanoid()
    //       }
    //     }
    //   }
    // }
  },

  // extraReducers xử lý asyncThunk
  extraReducers(builder) {
    builder
      // .addCase('blog/getPostListSuccess', (state, action: any) => {
      //   state.postList = action.payload
      // })
      .addCase(getPostList.fulfilled, (state, action) => {
        state.postList = action.payload
      })
      .addCase(addPost.fulfilled, (state, action) => {
        state.postList.push(action.payload)
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.postList.find((post, index) => {
          if (post.id === action.payload.id) {
            state.postList[index] = action.payload
            return true
          }
          return false
        })
        state.editingPost = null
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const postId = action.meta.arg
        const deletePostIndex = state.postList.findIndex((post) => post.id === postId)
        if (deletePostIndex !== -1) {
          state.postList.splice(deletePostIndex, 1)
        }
      })
      // .addMatcher(
      //   (action) => action.type.includes('cancel'),
      //   (state, action) => {
      //     console.log(current(state))
      //   }
      // )
      .addMatcher<PendingAction>(
        (action) => action.type.endsWith('/pending'),
        (state, action) => {
          state.loading = true
        }
      )
      .addMatcher<RejectedAction>(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false
        }
      )
      .addMatcher<FulfilledAction>(
        (action) => action.type.endsWith('/fulfilled'),
        (state, action) => {
          state.loading = false
        }
      )
      .addDefaultCase((state, action) => {
        console.log(`action type: ${action.type}`, current(state))
      })
  }
})

// // builder callback xử lý action và cập nhật state
// const blogReducer = createReducer(initialState, (builder) => {
//   builder
//     .addCase(addPost, (state, action) => {
//       // immerjs
//       // immerjs giúp chúng ta mutate một state an toàn
//       const post = action.payload
//       state.postList.push(post)
//     })
//     .addCase(deletePost, (state, action) => {
//       const postId = action.payload
//       const foundPostIndex = state.postList.findIndex((post) => post.id === postId)
//       if (foundPostIndex !== -1) {
//         state.postList.splice(foundPostIndex, 1)
//       }
//     })
//     .addCase(startEditingPost, (state, action) => {
//       const postId = action.payload
//       const foundPost = state.postList.find((post) => post.id === postId) || null
//       state.editingPost = foundPost
//     })
//     .addCase(cancelEditingPost, (state) => {
//       state.editingPost = null
//     })
//     .addCase(finishEditingPost, (state, action) => {
//       const postId = action.payload.id
//       state.postList.some((post, index) => {
//         if ((post.id = postId)) {
//           state.postList[index] = action.payload
//           return true
//         }
//         return false
//       })
//       state.editingPost = null
//     })
// })

export const { cancelEditingPost, startEditingPost } = blogSlice.actions
const blogReducer = blogSlice.reducer

export default blogReducer

// export default blogReducer
