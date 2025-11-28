import { exec } from 'child_process';
import * as fs from 'fs';

/**
 * Convert video sang WebM (VP9 + Opus)
 */
export const convertToWebm = (input, output) => {
  return new Promise((resolve, reject) => {
    const cmd = `ffmpeg -i "${input}" -c:v libvpx-vp9 -b:v 1M -c:a libopus "${output}"`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error('FFmpeg WebM error:', stderr);
        reject(err);
      } else {
        resolve(output);
      }
    });
  });
};

/**
 * Convert video sang HLS (index.m3u8 + .ts segments)
 */
export const convertToHLS = (input, outputDir) => {
  return new Promise((resolve, reject) => {
    // Tạo thư mục nếu chưa có
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const cmd = `ffmpeg -i "${input}" \
      -profile:v baseline -level 3.0 -start_number 0 \
      -hls_time 10 -hls_list_size 0 -f hls "${outputDir}/index.m3u8"`;

    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error('FFmpeg HLS error:', stderr);
        reject(err);
      } else {
        resolve(`${outputDir}/index.m3u8`);
      }
    });
  });
};