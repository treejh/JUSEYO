// "use client";

// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { FC, useState } from "react";
// import categoryService, { BusinessError } from "@/services/categoryService";
// import { toast } from "sonner";

// const AddCategoryPage: FC = () => {
//   const router = useRouter();
//   const [categoryName, setCategoryName] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!categoryName.trim()) {
//       toast.error("카테고리 이름을 입력해주세요.");
//       return;
//     }

//     try {
//       setIsSubmitting(true);
//       await categoryService.createCategory({ name: categoryName.trim() });
//       toast.success("카테고리가 생성되었습니다.");
//       router.push("/settings/categories");
//     } catch (err) {
//       if (err instanceof BusinessError) {
//         toast.error(err.message);
//       } else {
//         toast.error("카테고리 생성에 실패했습니다.");
//       }
//       console.error("Error creating category:", err);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* 전체 레이아웃 컨테이너 */}
//       <div className="flex min-h-screen">
//         {/* 메인 콘텐츠 영역 */}
//         <div className="flex-1 p-12 pt-8 pl-16 bg-white">
//           <div className="mb-6 mt-6">
//             <h1 className="text-2xl font-bold text-gray-900">카테고리 추가</h1>
//           </div>

//           <form onSubmit={handleSubmit}>
//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 카테고리 이름
//               </label>
//               <input
//                 type="text"
//                 value={categoryName}
//                 onChange={(e) => setCategoryName(e.target.value)}
//                 placeholder="카테고리를 입력해 주세요."
//                 className="w-full p-2 border-2 border-gray-200 rounded-md focus:border-[#0047AB] focus:outline-none transition-colors"
//                 disabled={isSubmitting}
//               />
//             </div>

//             <div className="flex space-x-4 mt-12">
//               <Button
//                 type="submit"
//                 className="bg-[#0047AB] text-white px-4 py-2 rounded text-base hover:bg-[#003380] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? "처리 중..." : "확인"}
//               </Button>
//               <Link href="/settings/categories">
//                 <Button
//                   type="button"
//                   className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed"
//                   disabled={isSubmitting}
//                 >
//                   취소
//                 </Button>
//               </Link>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddCategoryPage;
