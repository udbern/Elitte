export default {
  name: 'team',
  title: 'Team',
  type: 'document',
  fields: [
    {name: 'name', title: 'Team Name', type: 'string'},
    {name: 'shortName', title: 'Short Name', type: 'string'},
    {name: 'coach', title: 'Coach/Manager', type: 'string'},
    {name: 'logo', title: 'Logo', type: 'image'},
    {
      name: 'seasons',
      title: 'Seasons',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'season' }] }],
      description: 'The seasons this team participates in',
    },
  ],
}
