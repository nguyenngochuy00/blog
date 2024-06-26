import { PayloadAction, createAction, createReducer, createSlice, current, nanoid } from '@reduxjs/toolkit'
import { initialPostList } from 'constants/blog'
import { Post } from 'types/blog.type'

interface BlogState {
  postList: Post[]
  editingPost: Post | null
}

const initialState: BlogState = {
  // postList: initialPostList,
  postList: [],
  editingPost: null
}

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
    deletePost: (state, action: PayloadAction<string>) => {
      const postId = action.payload
      const foundPostIndex = state.postList.findIndex((post) => post.id === postId)
      if (foundPostIndex !== -1) {
        state.postList.splice(foundPostIndex, 1)
      }
    },
    startEditingPost: (state, action: PayloadAction<string>) => {
      const postId = action.payload
      const foundPost = state.postList.find((post) => post.id === postId) || null
      state.editingPost = foundPost
    },
    cancelEditingPost: (state) => {
      state.editingPost = null
    },
    finishEditingPost: (state, action: PayloadAction<Post>) => {
      const postId = action.payload.id
      state.postList.some((post, index) => {
        if ((post.id = postId)) {
          state.postList[index] = action.payload
          return true
        }
        return false
      })
      state.editingPost = null
    },
    addPost: {
      reducer: (state, action: PayloadAction<Post>) => {
        const post = action.payload
        state.postList.push(post)
      },
      prepare: (post: Omit<Post, 'id'>) => {
        return {
          payload: {
            ...post,
            id: nanoid()
          }
        }
      }
    }
  },
  extraReducers(builder) {
    builder
      .addCase('blog/getPostListSuccess', (state, action: any) => {
        state.postList = action.payload
      })
      .addMatcher(
        (action) => action.type.includes('cancel'),
        (state, action) => {
          console.log(current(state))
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

export const { addPost, cancelEditingPost, deletePost, finishEditingPost, startEditingPost } = blogSlice.actions
const blogReducer = blogSlice.reducer

export default blogReducer

// export default blogReducer
