"use client";
import { useParams } from "next/navigation";

const CategoryPost = () => {
  const { slug } = useParams(); // Get dynamic postId

  return (
    <div>
      <h1>Category Post ID: {slug}</h1>
    </div>
  );
};

export default CategoryPost;
