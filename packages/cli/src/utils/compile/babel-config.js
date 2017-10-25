function getConfig() {
  return {
    sourceMaps: true,
    code: true,
    babelrc: false,
    plugins: [
      require.resolve('babel-plugin-syntax-async-functions'),
      require.resolve('babel-plugin-syntax-object-rest-spread'),
      require.resolve('babel-plugin-transform-object-rest-spread'),
      require.resolve('babel-plugin-transform-class-properties'),
      require.resolve('babel-plugin-transform-export-extensions'),
      require.resolve('babel-plugin-transform-decorators-legacy'),
      require.resolve('babel-plugin-transform-async-to-generator'),
      require.resolve('babel-plugin-extensible-destructuring')
    ],
    presets: [
      [
        require.resolve('babel-preset-env'),
        {
          targets: {
            node: '7'
          }
        }
      ]
    ]
  };
}

export default getConfig;
