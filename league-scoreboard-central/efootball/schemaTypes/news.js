export default {
  name: 'news',
  title: 'News',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'summary',
      title: 'Summary',
      type: 'text'
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Transfer', value: 'transfer' },
          { title: 'Match', value: 'match' },
          { title: 'Injury', value: 'injury' },
          { title: 'Other', value: 'other' },
        ]
      }
    },
    {
      name: 'thumbnail_url',
      title: 'Thumbnail URL',
      type: 'image',
      options: {
        hotspot: true
      }
    },
    {
      name: 'published_at',
      title: 'Published At',
      type: 'datetime',
      validation: Rule => Rule.required()
    }
  ],
  preview: {
    select: {
      title: 'title',
      media: 'thumbnail_url'
    }
  }
}
