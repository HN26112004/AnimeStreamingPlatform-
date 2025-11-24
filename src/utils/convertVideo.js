import { exec } from 'child_process';

export const convertToWebm = (input, output) => {
  return new Promise((resolve, reject) => {
    const cmd = `ffmpeg -i "${input}" -c:v libvpx-vp9 -b:v 1M -c:a libopus "${output}"`;
    exec(cmd, (err) => (err ? reject(err) : resolve(output)));
  });
};

export const convertToHLS = (input, outputDir) => {
  return new Promise((resolve, reject) => {
    const cmd = `ffmpeg -i "${input}" -codec: copy -start_number 0 -hls_time 10 -hls_list_size 0 -f hls "${outputDir}/index.m3u8"`;
    exec(cmd, (err) => (err ? reject(err) : resolve(`${outputDir}/index.m3u8`)));
  });
};

