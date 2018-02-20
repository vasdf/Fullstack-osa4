const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => blogs.reduce((sum, blog) => sum + blog.likes, 0)

const formatBlog = (blog) => {
  return {
    title: blog.title,
    author: blog.author,
    likes: blog.likes
  }
}

const favoriteBlog = (blogs) =>
  blogs
    .reduce(
      (favorite, blog) => {
        if (favorite.likes < blog.likes) {
          return formatBlog(blog)
        } else {
          return favorite
        }
      }, formatBlog(blogs[0]))

const mostBlogs = (blogs) => {
  var largestNumberOfBlogs = 0
  return blogs
    .reduce(
      (blogsPerAuthor, blog) => {
        if (blogsPerAuthor.find((blogger) => blogger.author === blog.author) === undefined) {

          if (largestNumberOfBlogs === 0) {
            largestNumberOfBlogs = 1
          }
          
          return blogsPerAuthor.concat({ author: blog.author, blogs: 1 })
        } else {
          return blogsPerAuthor
            .map((blogger) => {
              if (blogger.author === blog.author) {
                if (largestNumberOfBlogs < Number(blogger.blogs) + 1) {
                  largestNumberOfBlogs = Number(blogger.blogs) + 1
                }
                blogger.blogs = Number(blogger.blogs) + 1
              }
              return blogger
            })

        }
      }, []).find((blogger) => blogger.blogs === largestNumberOfBlogs) || []
}

const mostLikes = (blogs) => {
  var largestNumberOfLikes = 0
  return blogs
    .reduce(
      (likesPerAuthor, blog) => {
        if (likesPerAuthor.find((blogger) => blogger.author === blog.author) === undefined) {

          if (largestNumberOfLikes < blog.likes) {
            largestNumberOfLikes = blog.likes
          }

          return likesPerAuthor.concat({ author: blog.author, likes: blog.likes })
        } else {
          return likesPerAuthor
            .map((blogger) => {
              if (blogger.author === blog.author) {
                if (largestNumberOfLikes < Number(blogger.likes) + blog.likes) {
                  largestNumberOfLikes = Number(blogger.likes) + blog.likes
                }
                blogger.likes = Number(blogger.likes) + blog.likes
              }
              return blogger
            })
        }
      }, []).find((blogger) => blogger.likes === largestNumberOfLikes) || []
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}