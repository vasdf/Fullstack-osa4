const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const { initialBlogs, format, blogsInDb, nonExistingId, usersInDb } = require('./test_helper')

beforeAll(async () => {
  await Blog.remove({})

  const blogObjects = initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

describe('when there is initially some blogs saved', async () => {
  beforeAll(async () => {
    await Blog.remove({})

    const blogObjects = initialBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
  })

  test('all are returned as json by GET /api/blogs', async () => {

    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-type', /application\/json/)

    const blogsInDatabase = await blogsInDb()

    expect(response.body.length).toBe(blogsInDatabase.length)

    const returnedBlogs = response.body.map(format)
    blogsInDatabase.forEach(blog => {
      expect(returnedBlogs).toContainEqual(blog)
    })
  })
})

describe('addition of a new blog', async () => {

  test('POST /api/blogs succeeds with valid data', async () => {
    const newBlog = {
      title: "Testi",
      author: "Testaaja",
      url: "www.testi.fi",
      likes: 321
    }

    const blogsBefore = await blogsInDb()

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-type', /application\/json/)

    const blogsAfter = await blogsInDb()

    expect(blogsAfter.length).toBe(blogsBefore.length + 1)

    expect(blogsAfter).toContainEqual(newBlog)
  })

  test('POST /api/blogs succeeds with valid data without likes defined and sets likes to 0', async () => {
    const newBlog = {
      title: "Testi2",
      author: "Testaaja2",
      url: "www.testi2.fi"
    }

    const blogsBefore = await blogsInDb()

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-type', /application\/json/)

    const blogsAfter = await blogsInDb()

    expect(blogsAfter.length).toBe(blogsBefore.length + 1)

    expect(blogsAfter).toContainEqual(
      {
        title: "Testi2",
        author: "Testaaja2",
        url: "www.testi2.fi",
        likes: 0
      }
    )
  })

  test('POST /api/blogs fails with proper statuscode if title is missing', async () => {
    const newBlog = {
      author: "Testaaja3",
      url: "www.testi3.fi",
      likes: 3
    }

    const blogsBefore = await blogsInDb()

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const blogsAfter = await blogsInDb()

    expect(blogsAfter.length).toBe(blogsBefore.length)
  })

  test('POST /api/blogs fails with proper statuscode if url is missing', async () => {
    const newBlog = {
      title: "Testi4",
      author: "Testaaja4",
      likes: 4
    }

    const blogsBefore = await blogsInDb()

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const blogsAfter = await blogsInDb()

    expect(blogsAfter.length).toBe(blogsBefore.length)
  })
})

describe('deletion of a blog', async () => {
  let addedBlog

  beforeAll(async () => {
    addedBlog = new Blog({
      title: "Poista",
      author: "Poistaja",
      url: "www.poista.fi",
      likes: 5
    })
    const savedBlog = await addedBlog.save()
  })

  test('DELETE /api/blogs/:id succeeds with proper statuscode', async () => {
    const blogsBefore = await blogsInDb()

    await api
      .delete(`/api/blogs/${addedBlog._id}`)
      .expect(204)

    const blogsAfter = await blogsInDb()

    expect(blogsAfter.length).toBe(blogsBefore.length - 1)

    expect(blogsAfter).not.toContainEqual(addedBlog)
  })
})

describe('when there is initially one user saved', async () => {
  beforeAll(async () => {
    await User.remove({})

    const user = new User({
      username: "Testi",
      name: "Testaaja",
      password: "asdasdf",
      adult: "true"
    })

    await user.save()
  })

  test('POST /api/users succeeds with valid data', async () => {
    const newUser = {
      username: "Testi2",
      name: "Testaaja2",
      password: "asdfasdf",
      adult: "false"
    }

    const usersBefore = await usersInDb()

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAfter = await usersInDb()

    expect(usersAfter.length).toBe(usersBefore.length + 1)

    const usernamesAfter = usersAfter.map(user => user.username)
    expect(usernamesAfter).toContain("Testi2")
  })

  test('POST /api/users fails with proper statuscode if password is too short', async () => {
    const newUser = {
      username: "Testi3",
      name: "Testaaja3",
      password: "a",
      adult: "false"
    }

    const usersBefore = await usersInDb()

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body).toEqual({ error: 'password too short' })

    const usersAfter = await usersInDb()

    expect(usersAfter.length).toBe(usersBefore.length)

    const usernamesAfter = usersAfter.map(user => user.username)
    expect(usernamesAfter).not.toContain("Testi3")
  })

  test('POST /api/users fails with proper statudcode if username is not unique', async () => {
    const newUser = {
      username: "Testi",
      name: "Testaaja4",
      password: "asdfasdf",
      adult: "true"
    }

    const usersBefore = await usersInDb()

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body).toEqual({ error: 'username must be unique' })

    const usersAfter = await usersInDb()

    expect(usersAfter.length).toBe(usersBefore.length)
  })

  test('POST /api/users succeeds if adult is not defined and it defaults it to true', async () => {
    const newUser = {
      username: "Testi5",
      name: "Testaaja5",
      password: "asdfasdf"
    }

    const usersBefore = await usersInDb()

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAfter = await usersInDb()

    expect(usersAfter.length).toBe(usersBefore.length + 1)  

    const usernamesAndAdult = usersAfter.map(user => {
      return {
        username: user.username,
        adult: user.adult
      } 
    })
    expect(usernamesAndAdult).toContainEqual({ username: "Testi5", adult: true })
  })
})

afterAll(() => {
  server.close()
})