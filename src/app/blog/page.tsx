"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDate } from "@/utils/date";
import IconTime from "../../assets/images/icon-time.png";
import IconAuthor from "../../assets/images/icon-author.png";
import IconSearch from "../../assets/images/icon-search.png";

class BlogData {
  id: string;
  slug: string;
  postImage: string;
  title: string;
  excerpt: string;
  date: string;
  authorName: string;
  categories: number[];

  constructor(data: any) {
    this.id = data?.id;
    this.slug = data?.slug;
    this.postImage = data?._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
    this.title = data?.title?.rendered;
    this.excerpt = data?.excerpt?.rendered;
    this.date = data?.date;
    this.authorName = data?._embedded?.author[0]?.name;
    this.categories = data?._embedded["wp:term"][0];
  }
}

interface Category {
  id: number;
  name: string;
}

const Blog = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<BlogData[]>([]);
  const [searchNoResults, setSearchNoResults] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const postsPerPage = 10;

  const [categoryId, setCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPosts = async (page = 1) => {
    console.log(`Fetching all posts for page ${page}`);
    try {
      setIsLoading(true);
      const posts = `https://wp-blog-page.local/wp-json/wp/v2/posts?_embed&per_page=${postsPerPage}&page=${page}`;
      const response = await fetch(posts);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      // console.log("data: ", data);
      const blogPosts = data.map((item: any) => new BlogData(item));

      setPosts(blogPosts);
      setSearchNoResults(blogPosts.length === 0);

      const totalPosts = response.headers.get("X-WP-Total");
      const totalPostsNumber = totalPosts !== null ? Number(totalPosts) : 0;
      setPosts(blogPosts);
      setTotalPages(Math.ceil(totalPostsNumber / postsPerPage));
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categories = `https://wp-blog-page.local/wp-json/wp/v2/categories`;
      const response = await fetch(categories);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("categories: ", data);
      setCategories(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const fetchPostsByCategory = async (categoryId: number, page = 1) => {
    setIsLoading(true);
    setActiveCategory(categoryId);
    try {
      const res = await fetch(
        `https://wp-blog-page.local/wp-json/wp/v2/posts?_embed&categories=${categoryId}&per_page=${postsPerPage}&page=${page}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await res.json();
      console.log("post cateId: ", data);
      const blogPosts = data.map((item: any) => new BlogData(item));
      setPosts(blogPosts);
    } catch (error) {
      console.error("Error fetching posts by category: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: number) => {
    // const newUrl = `/blog?categories=${categoryId}`;
    // window.history.pushState(null, "", newUrl);
    setActiveCategory(categoryId);
    if (categoryId === null) {
      fetchPosts();
    } else {
      fetchPostsByCategory(categoryId);
    }
  };

  // const searchPosts = async (query: any, page = 1) => {
  //   try {
  //     const response = await fetch(
  //       `https://wp-blog-page.local/wp-json/wp/v2/posts?_embed&search=${query}&per_page=${postsPerPage}&page=${page}`
  //     );
  //     if (!response.ok)
  //       throw new Error(`HTTP error! Status: ${response.status}`);
  //     const data = await response.json();
  //     console.log("data-search: ", data);
  //     const blogPosts = data.map((item: any) => new BlogData(item));
  //     const totalPosts = response.headers.get("X-WP-Total");
  //     const totalPostsNumber = totalPosts !== null ? Number(totalPosts) : 0;
  //     setPosts(blogPosts);
  //     setTotalPages(Math.ceil(totalPostsNumber / postsPerPage));
  //   } catch (error) {
  //     console.error("Error searching posts:", error);
  //   }
  // };

  // const handleSearch = () => {
  //   setCurrentPage(1);
  //   if (searchQuery) {
  //     searchPosts(searchQuery, 1);
  //   } else if (categoryId) {
  //     fetchPostsByCategory(categoryId, 1);
  //   } else {
  //     fetchPosts(1);
  //   }
  // };

  // const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (e.key === "Enter") {
  //     handleSearch();
  //   }
  // };

  // const clearInput = () => {
  //   setSearchQuery("");
  // };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (searchQuery) {
      // searchPosts(searchQuery, newPage);
    } else if (categoryId) {
      // fetchPostsByCategory(categoryId, newPage);
    } else {
      fetchPosts(newPage);
    }
  };

  const renderPaginationItems = () => {
    const paginationItems = [];
    for (let i = 1; i <= totalPages; i++) {
      paginationItems.push(
        <button
          key={i}
          className={`pagination-item ${i === currentPage ? "active" : ""}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    return paginationItems;
  };

  return (
    <main id="blog-page">
      <div className="page">
        <div className="container">
          <div className="search-container">
            <div className="search-box">
              <img
                className="search-icon"
                src={IconSearch.src}
                alt="Post Image"
                width={180}
                height={101}
                // onClick={handleSearch}
              />
              <div className="search-wrapper-input">
                <input
                  className="search-input"
                  type="text"
                  name="search"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                  // onKeyDown={handleKeyDown}
                />
                {searchQuery && (
                  <button
                    className="close-icon"
                    type="reset"
                    // onClick={clearInput}
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>
            <p className="search-title">
              Results for <span className="search-result">{searchQuery}</span>
            </p>
          </div>
          <div className="category-container">
            <div className="category-list">
              {categories?.map((category) => (
                <div
                  key={category.id}
                  className={`category-item ${
                    activeCategory === category.id ? "active" : ""
                  }`}
                  onClick={() => {
                    console.log("cate id clicked: ", category.id);
                    handleCategoryChange(category.id);
                  }}
                >
                  <span className="category-name">{category.name}</span>
                </div>
              ))}
            </div>
          </div>
          {isLoading ? (
            <section className="skeleton-list">
              <article className="skeleton-card">
                <div className="skeleton-item">
                  <div className="skeleton-content">
                    <h2 className="skeleton-text skeleton-title"></h2>
                    <p className="skeleton-text skeleton-sub-title"></p>
                    <p className="skeleton-text skeleton-date-author"></p>
                    <div className="wrapper-skeleton-content">
                      <span className="skeleton-text skeleton-category"></span>
                      <span className="skeleton-text skeleton-category"></span>
                      <span className="skeleton-text skeleton-category"></span>
                    </div>
                  </div>
                  <figure className="skeleton-image"></figure>
                </div>
                <div className="skeleton-text skeleton-border"></div>
              </article>
              <article className="skeleton-card">
                <div className="skeleton-item">
                  <div className="skeleton-content">
                    <h2 className="skeleton-text skeleton-title"></h2>
                    <p className="skeleton-text skeleton-sub-title"></p>
                    <p className="skeleton-text skeleton-date-author"></p>
                    <div className="wrapper-skeleton-content">
                      <span className="skeleton-text skeleton-category"></span>
                      <span className="skeleton-text skeleton-category"></span>
                      <span className="skeleton-text skeleton-category"></span>
                    </div>
                  </div>
                  <figure className="skeleton-image"></figure>
                </div>
                <div className="skeleton-text skeleton-border"></div>
              </article>
              <article className="skeleton-card">
                <div className="skeleton-item">
                  <div className="skeleton-content">
                    <h2 className="skeleton-text skeleton-title"></h2>
                    <p className="skeleton-text skeleton-sub-title"></p>
                    <p className="skeleton-text skeleton-date-author"></p>
                    <div className="wrapper-skeleton-content">
                      <span className="skeleton-text skeleton-category"></span>
                      <span className="skeleton-text skeleton-category"></span>
                      <span className="skeleton-text skeleton-category"></span>
                    </div>
                  </div>
                  <figure className="skeleton-image"></figure>
                </div>
                <div className="skeleton-text skeleton-border"></div>
              </article>
              <article className="skeleton-card">
                <div className="skeleton-item">
                  <div className="skeleton-content">
                    <h2 className="skeleton-text skeleton-title"></h2>
                    <p className="skeleton-text skeleton-sub-title"></p>
                    <p className="skeleton-text skeleton-date-author"></p>
                    <div className="wrapper-skeleton-content">
                      <span className="skeleton-text skeleton-category"></span>
                      <span className="skeleton-text skeleton-category"></span>
                      <span className="skeleton-text skeleton-category"></span>
                    </div>
                  </div>
                  <figure className="skeleton-image"></figure>
                </div>
                <div className="skeleton-text skeleton-border"></div>
              </article>
              <article className="skeleton-card">
                <div className="skeleton-item">
                  <div className="skeleton-content">
                    <h2 className="skeleton-text skeleton-title"></h2>
                    <p className="skeleton-text skeleton-sub-title"></p>
                    <p className="skeleton-text skeleton-date-author"></p>
                    <div className="wrapper-skeleton-content">
                      <span className="skeleton-text skeleton-category"></span>
                      <span className="skeleton-text skeleton-category"></span>
                      <span className="skeleton-text skeleton-category"></span>
                    </div>
                  </div>
                  <figure className="skeleton-image"></figure>
                </div>
                <div className="skeleton-text skeleton-border"></div>
              </article>
            </section>
          ) : searchNoResults ? (
            <div className="no-results">
              <p className="results-title">
                No results found for
                <span className="text-search"> "{searchQuery}"</span>
              </p>
              <p className="results-sub-title">
                We're sorry what you were looking for. Please try another way.
              </p>
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="card-list">
                {posts.map((post: BlogData) => (
                  <article key={post.id} className="card-item">
                    <Link className="card-link" href={`/blog/${post?.slug}`}>
                      <div className="card">
                        <figure className="card-img">
                          <img
                            src={post?.postImage}
                            alt="Post Image"
                            width={180}
                            height={101}
                          />
                        </figure>
                        <div className="card-content">
                          <h4 className="card-title">{post?.title}</h4>
                          <p
                            className="card-sub-title"
                            dangerouslySetInnerHTML={{
                              __html: post?.excerpt,
                            }}
                          />
                          <div className="card-footer">
                            <div className="card-time">
                              <img
                                className="card-icon-time"
                                src={IconTime?.src}
                                alt="Icon Time"
                              />
                              <time
                                className="card-text-time"
                                dangerouslySetInnerHTML={{
                                  __html: formatDate(post?.date),
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
                                  __html: post?.authorName,
                                }}
                              />
                            </div>
                          </div>
                          <aside className="card-category">
                            {post?.categories?.map((category: any) => (
                              <div
                                className="card-category-label"
                                key={category?.id}
                              >
                                <span className="card-text-category">
                                  {category?.name}
                                </span>
                              </div>
                            ))}
                          </aside>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </button>
                <span>{renderPaginationItems()}</span>
                <button
                  className="btn-next"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="no-results">
              <p className="results-title">No posts available.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Blog;
