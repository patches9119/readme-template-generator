module.exports = {
  name: 'readme-template-generator',
  run: async toolbox => {
    const {
      parameters,
      existingFiles,
      getPastName,
      question,
      removeFiles,
      generateFile
    } = toolbox

    const additional_files = await existingFiles('readme.md')

    if (additional_files.length) {
      const confirm_remove = await question({
        type: 'confirm',
        message: 'There are other readme files, do you want to remove them?'
      })

      if (confirm_remove) removeFiles(additional_files)
    }

    const project_name = parameters.first || getPastName()

    const useHtml = await question({
      type: 'select',
      message: 'Do you want to use HTML in your README file for best results?',
      choices: ['Yes', 'No']
    })

    generateFile({
      template: useHtml === 'Yes' ? 'README.md.ejs' : 'README-no-html.md.ejs',
      target: `./README.md`,
      props: { project_name }
    })
  }
}
