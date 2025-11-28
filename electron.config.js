module.exports = {
  // Electron Forge configuration
  packagerConfig: {
    name: 'MediTrack Hospital Management',
    executableName: 'meditrack-hospital',
    icon: './frontend/assets/logo',
    asar: true,
    ignore: [
      /^\/\.git/,
      /^\/node_modules\/\.cache/,
      /^\/dist/,
      /^\/build/,
      /^\/coverage/,
      /^\/\.nyc_output/,
      /^\/test/,
      /^\/tests/,
      /\.test\./,
      /\.spec\./
    ]
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'meditrack_hospital'
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin']
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'MediTrack Systems',
          homepage: 'https://github.com/meditrack/hospital'
        }
      }
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {}
    }
  ]
};