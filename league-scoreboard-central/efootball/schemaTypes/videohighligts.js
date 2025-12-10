export default {
  name: 'videoHighlight',
  title: 'Video Highlight',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'homeTeam',
      title: 'Home Team',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'awayTeam',
      title: 'Away Team',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'duration',
      title: 'Video Duration',
      type: 'string',
      description: 'Format e.g., 3:45'
    },
    {
      name: 'date',
      title: 'Match Date',
      type: 'date',
      validation: Rule => Rule.required()
    },
    {
      name: 'views',
      title: 'Views',
      type: 'string'
    },
    {
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      options: { hotspot: true }
    },
    {
      name: 'video_url',
      title: 'Video URL',
      type: 'url'
    }
  ],
  preview: {
    select: {
      title: 'title',
      media: 'thumbnail'
    }
  }
}
