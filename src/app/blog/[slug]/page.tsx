"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { formatDate } from "@/utils/date";
import IconTime from "../../../assets/images/icon-time.png";
import IconAuthor from "../../../assets/images/icon-author.png";

class BlogDetailData {
  title: string;
  content: string;
  date: string;
  authorName: string;
  categories: [];
  constructor(data: any) {
    this.title = data.title.rendered;
    this.content = data.content.rendered;
    this.date = data.date;
    this.authorName = data._embedded.author[0].name;
    this.categories = data._embedded["wp:term"][0];
  }
}

const BlogDetail = () => {
  const { slug } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [dataDetail, setDataDetail] = useState<BlogDetailData | null>(null);

  const fetchPostDetail = () => {
    try {
      setTimeout(async () => {
        const response = await fetch(
          `https://wp-blog-page.local/wp-json/wp/v2/posts?slug=${slug}&_embed`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setDataDetail(new BlogDetailData(data[0]));
      }, 500);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPostDetail();
  }, []);

  return (
    <main className="blog-detail-page">
      <div className="detail-page">
        <div className="container">
          {!isLoading && dataDetail ? (
            <>
              <h1
                className="title"
                dangerouslySetInnerHTML={{ __html: dataDetail?.title || "" }}
              />
              <div className="detail-meta">
                <div className="card-time">
                  <img
                    className="card-icon-time"
                    src={IconTime?.src}
                    alt="Icon Time"
                  />
                  <time
                    className="card-text-time"
                    dangerouslySetInnerHTML={{
                      __html: formatDate(dataDetail?.date),
                    }}
                  />
                </div>
                <div className="card-author">
                  <img
                    className="card-icon-author"
                    src={IconAuthor?.src}
                    alt="Icon Author"
                  />
                  <span
                    className="card-text-author"
                    dangerouslySetInnerHTML={{
                      __html: dataDetail?.authorName,
                    }}
                  />
                </div>
              </div>
              <div className="category">
                {dataDetail?.categories?.map((category: any) => (
                  <div className="card-category-label" key={category?.id}>
                    <span className="card-text-category">{category?.name}</span>
                  </div>
                ))}
              </div>
              <div
                className="blog-detail-content"
                dangerouslySetInnerHTML={{
                  __html: dataDetail?.content || "",
                }}
              />
            </>
          ) : (
            <div className="skeleton-wrapper">
              <div className="skeleton-text skeleton-title"></div>
              <div className="skeleton-text skeleton-date-author"></div>
              <div className="skeleton-text skeleton-category"></div>
              <div className="skeleton-text skeleton-detail-content"></div>
              <div className="skeleton-image"></div>
              <div className="skeleton-text skeleton-title"></div>
              <div className="skeleton-text skeleton-title"></div>
              <div className="skeleton-text short"></div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default BlogDetail;
