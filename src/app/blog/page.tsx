"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDate } from "@/utils/date";
import IconTime from "../../assets/images/icon-time.png";
import IconAuthor from "../../assets/images/icon-author.png";
import IconSearch from "../../assets/images/icon-search.png";

// BlogData class to map the response data
class BlogData {
  id: string;
  slug: string;
  postImage: string | undefined;
  title: string | undefined;
  excerpt: string | undefined;
  date: string | undefined;
  authorName: string | undefined;
  categories: number[];
  constructor(data: any) {
    this.id = data?.id;
    this.slug = data?.slug;
    this.postImage = data?._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
    this.title = data?.title?.rendered;
    this.excerpt = data?.excerpt?.rendered;
    this.date = data?.date;
    this.authorName = data?._embedded?.author?.[0]?.name;
    this.categories = data?._embedded?.["wp:term"]?.[0] ?? [];
  }
}

// Interface for category
interface Category {
  id: number;
  name: string;
}

const Blog = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<BlogData[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const postsPerPage = 10;
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<number | null>(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchValue, setSearchValue] = useState("");

  // Fetch Posts function
  const fetchPosts = async (page = 1) => {
    try {
      setIsLoading(true);
      const posts = `https://wp-blog-page.local/wp-json/wp/v2/posts?_embed&per_page=${postsPerPage}&page=${page}`;
      const response = await fetch(posts);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      const blogPosts = data.map((item: any) => new BlogData(item));
      setPosts(blogPosts);
      const totalPosts = response.headers.get("X-WP-Total");
      const totalPostsNumber = totalPosts !== null ? Number(totalPosts) : 0;
      setTotalPages(Math.ceil(totalPostsNumber / postsPerPage));
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Categories function
  const fetchCategories = async () => {
    try {
      const categories = `https://wp-blog-page.local/wp-json/wp/v2/categories`;
      const response = await fetch(categories);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      const updatedCategories = [{ id: 0, name: "All" }, ...data];
      setCategories(updatedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  // Fetch Posts by Category function
  const fetchPostsByCategory = async (categoryId: number | null, page = 1) => {
    setIsLoading(true);
    setActiveCategory(categoryId);
    setPosts([]);
    try {
      let url = `https://wp-blog-page.local/wp-json/wp/v2/posts?_embed&per_page=${postsPerPage}&page=${page}`;
      if (categoryId) {
        url += `&categories=${categoryId}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      const blogPosts = data.map((item: any) => new BlogData(item));
      setPosts(blogPosts);
      const totalPosts = response.headers.get("X-WP-Total");
      const totalPostsNumber = totalPosts !== null ? Number(totalPosts) : 0;
      setTotalPages(Math.ceil(totalPostsNumber / postsPerPage));
    } catch (error) {
      console.error("Error fetching posts by category: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle change when click btn category_id
  const handleCategoryChange = (categoryId: number | null) => {
    setActiveCategory(categoryId);
    setCategoryId(categoryId);
    setCurrentPage(1);
    setSearchValue("");
    if (categoryId === 0) {
      fetchPosts(1);
    }
    if (!categoryId) {
      fetchPosts();
    } else {
      fetchPostsByCategory(categoryId, 1);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setSearchQuery("");
    if (isSearching && searchQuery) {
      searchPosts(searchQuery, newPage);
    } else if (activeCategory) {
      fetchPostsByCategory(activeCategory, newPage);
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

  // Search Posts function
  const searchPosts = async (query: string, page = 1) => {
    setSearchQuery("");
    try {
      setIsLoading(true);
      let url = `https://wp-blog-page.local/wp-json/wp/v2/posts?_embed&per_page=${postsPerPage}&page=${page}`;
      if (query) {
        url += `&search=${query}`;
      }
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      const blogPosts = data.map((item: any) => new BlogData(item));
      setPosts(blogPosts);
      const totalPosts = response.headers.get("X-WP-Total");
      const totalPostsNumber = totalPosts !== null ? Number(totalPosts) : 0;
      setTotalPages(Math.ceil(totalPostsNumber / postsPerPage));
    } catch (error) {
      console.error("Error searching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    setIsSearching(!!searchQuery);
    if (searchQuery) {
      searchPosts(searchQuery, 1);
      setSearchQuery("");
      setCategoryId(null);
      setActiveCategory(null);
      setSearchValue(searchQuery);
    } else {
      fetchPosts(1);
    }
  };

  // Handle KeyDown for search
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
      setSearchQuery("");
      setCategoryId(null);
      setActiveCategory(null);
    }
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
                onClick={handleSearch}
              />
              <div className="search-wrapper-input">
                <input
                  className="search-input"
                  type="text"
                  name="search"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                  onKeyDown={handleKeyDown}
                />
                {searchQuery && (
                  <button
                    className="close-icon"
                    type="reset"
                    onClick={() => setSearchQuery("")}
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>
            <p className="search-title">
              Results for
              {searchValue && (
                <span className="search-result"> {searchValue}</span>
              )}
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
                  onClick={() => handleCategoryChange(category.id)}
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
          ) : (
            <section className="posts-list">
              {posts.length > 0 ? (
                posts.map((post) => (
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
                              __html: post?.excerpt || "",
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
                                  __html: formatDate(post?.date || ""),
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
                                  __html: post?.authorName || "",
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
                ))
              ) : (
                <div className="no-results">
                  <p className="results-title">No posts available.</p>
                </div>
              )}
            </section>
          )}
          {posts.length > 0 && totalPages > 1 ? (
            <div className="pagination">
              <button
                disabled={currentPage === 1 || totalPages === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </button>
              <span>{renderPaginationItems()}</span>
              <button
                className="btn-next"
                disabled={currentPage === totalPages || totalPages === 1}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
};

export default Blog;
