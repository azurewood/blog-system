// 'use client'

// import { useState, useEffect } from 'react'

// export default function CommentsPage() {
//   const [comments, setComments] = useState([])
//   const [filter, setFilter] = useState('pending') // 'all' | 'pending' | 'approved'

//   useEffect(() => {
//     fetchComments()
//   }, [filter])

//   const fetchComments = async () => {
//     try {
//       const token = localStorage.getItem('token')
//       const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      
//       const endpoint = filter === 'pending' 
//         ? '/api/admin/comments/pending'
//         : '/api/comments' // would need new endpoint for all comments
        
//       const res = await fetch(`${API_URL}${endpoint}`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       })
      
//       const data = await res.json()
//       setComments(data.data || [])
//     } catch (error) {
//       console.error('Failed to fetch comments:', error)
//     }
//   }

//   const handleApprove = async (id: string) => {
//     try {
//       const token = localStorage.getItem('token')
//       const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      
//       await fetch(`${API_URL}/api/comments/${id}/approve`, {
//         method: 'PUT',
//         headers: { 'Authorization': `Bearer ${token}` }
//       })
      
//       fetchComments()
//     } catch (error) {
//       console.error('Failed to approve comment:', error)
//     }
//   }

//   const handleDelete = async (id: string) => {
//     if (!confirm('Delete this comment?')) return
    
//     try {
//       const token = localStorage.getItem('token')
//       const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      
//       await fetch(`${API_URL}/api/comments/${id}`, {
//         method: 'DELETE',
//         headers: { 'Authorization': `Bearer ${token}` }
//       })
      
//       fetchComments()
//     } catch (error) {
//       console.error('Failed to delete comment:', error)
//     }
//   }

//   return (
//     <div>
//       <h1 className="text-3xl font-bold mb-8">Comment Moderation</h1>

//       {/* Filters */}
//       <div className="mb-6 flex gap-2">
//         <button
//           onClick={() => setFilter('pending')}
//           className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
//         >
//           Pending
//         </button>
//         <button
//           onClick={() => setFilter('all')}
//           className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
//         >
//           All
//         </button>
//       </div>

//       {/* Comments List */}
//       <div className="space-y-4">
//         {comments.length === 0 ? (
//           <p className="text-gray-500">No comments to review</p>
//         ) : (
//           comments.map(comment => (
//             <div key={comment.id} className="bg-white p-6 rounded-lg shadow">
//               <div className="flex justify-between items-start mb-4">
//                 <div>
//                   <p className="font-semibold">{comment.author_name}</p>
//                   <p className="text-sm text-gray-500">{comment.author_email}</p>
//                   <p className="text-sm text-gray-500">
//                     {new Date(comment.created_at).toLocaleString()}
//                   </p>
//                 </div>
//                 <div className="flex gap-2">
//                   {comment.is_approved ? (
//                     <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
//                       Approved
//                     </span>
//                   ) : (
//                     <>
//                       <button
//                         onClick={() => handleApprove(comment.id)}
//                         className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//                       >
//                         Approve
//                       </button>
//                       <button
//                         onClick={() => handleDelete(comment.id)}
//                         className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
//                       >
//                         Delete
//                       </button>
//                     </>
//                   )}
//                 </div>
//               </div>
//               <p className="text-gray-700">{comment.content}</p>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   )
// }