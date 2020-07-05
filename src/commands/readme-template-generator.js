module.exports = {
  name: 'readme-template-generator',
  run: async toolbox => {
    const {
      existingFiles,
      getGithubRepoUrl,
      getUrlItem,
      question,
      message,
      generateFile,
      isWebUrl,
      readJsonFile
    } = toolbox

    if (existingFiles('README.md').indexOf('README.md') !== -1) {
      const overwrite = await question({
        type: 'confirm',
        message: 'Alredy exists a README.md file, overwrite it?'
      })

      if (!overwrite) process.exit(0)
    }

    const githubRepository = { url: getGithubRepoUrl('.') }
    githubRepository.name = getUrlItem(githubRepository.url)
    githubRepository.user = getUrlItem(githubRepository.url, 2)

    const projectName = githubRepository.name || getUrlItem('.')

    const packageJson = readJsonFile('package.json')

    const badgeChoices = ['Open Source', 'Awesome']

    if (githubRepository.url) {
      badgeChoices.push(
        'Language Most Used',
        'Implementations',
        'Gitpod',
        'Social Medias',
        'License',
        'Last Commit'
      )
    }

    if (packageJson.name) {
      badgeChoices.push('NPM Version', 'NPM Monthly Downloads')
    }

    const herokuUrl = await question({
      message: 'Heroku Url (use empty value to skip):',
      validate: value =>
        isWebUrl(`https://${value}`) || value === '' ? true : 'Invalid URL',
      customReturn: value => {
        if (value !== '') return `https://${value}`
        return value
      }
    })

    if (herokuUrl) badgeChoices.push('Heroku')

    const replitUrl =
      githubRepository.url &&
      (await question({
        message: 'Rep.it Url (use empty value to skip):',
        customReturn: value => {
          if (value !== '') return `https://${value}.repl.run`
          return value
        }
      }))

    if (replitUrl) badgeChoices.push('Repl.it')

    const useBadges = await question({
      type: 'checkbox',
      message: 'Select badges for use:\n',
      choices: badgeChoices,
      customReturn: value =>
        value.map(badge => badge.toLowerCase().replace(/\s/g, ''))
    })

    await generateFile({
      template: 'README.md.ejs',
      target: 'README.md',
      props: {
        projectName,
        useBadges,
        githubRepository,
        herokuUrl,
        replitUrl,
        packageJson
      }
    })

    message('success', 'Generated README.md file with success in current dir!')
  }
}
