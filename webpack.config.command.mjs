import path from 'path';

export default {
    mode: 'production',
    entry: './src/command.ts',
    output: {
        path: path.resolve(path.dirname(''), 'dist'),
        filename: 'command.js',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    target: 'node',
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
};