const branch = process.env.GITHUB_REF_NAME || process.env.CI_COMMIT_BRANCH

const config = {
  branches: [
    {
      name: 'stable',
      channel: 'latest',
    },
    {
      name: 'main',
      prerelease: 'next',
      channel: 'next',
    },
    {
      name: '+([0-9])?(.{+([0-9]),x})',
      channel: "${name.replace(/\\.x$/, '')}",
      range: "${name.replace(/\\.x$/, '.x')}",
    },
  ],
  tagFormat: 'v${version}',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
  ],
}

// Only add changelog and git plugins for non-prerelease branches
const isPrerelease = config.branches.some(
  (b) => typeof b === 'object' && b.name === branch && b.prerelease
)

if (!isPrerelease) {
  config.plugins.push('@semantic-release/changelog', [
    '@semantic-release/git',
    {
      assets: ['CHANGELOG.md', 'package.json'],
      message:
        'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
    },
  ])
}
// Always add npm and github plugins
config.plugins.push(
  [
    '@semantic-release/npm',
    {
      npmPublish: true,
    },
  ],
  '@semantic-release/github'
)

module.exports = config
