import path from 'path';
import axios from 'axios';
import { promises as fs } from 'fs';

import changeLinksToRelative from './parser.js';
import loadAllResources from './resources-service.js';
import { createLinkPath, linkTypesMapping } from './utils.js';
import log from './logger.js';

export default (requestUrl, outputPath) =>
  axios.get(requestUrl).then((res) => {
    log(`Loading the page ${requestUrl} to ${outputPath}`);
    const { links, updatedHtml } = changeLinksToRelative(res.data, requestUrl);
    const htmlPath = path.join(outputPath, createLinkPath(requestUrl, linkTypesMapping.html));
    return fs
      .writeFile(htmlPath, updatedHtml)
      .then(() => {
        const resDir = path.join(
          outputPath,
          createLinkPath(requestUrl, linkTypesMapping.directory)
        );
        return loadAllResources(links, resDir);
      })
      .catch((error) => {
        log(error.message);
        throw error;
      });
  });
