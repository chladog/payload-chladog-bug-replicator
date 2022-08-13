Test query:


query {
  MyPosts {
    docs {
      title
      owner {
        email
      }
    }
  }
}



See comment at
payload.config.ts::75