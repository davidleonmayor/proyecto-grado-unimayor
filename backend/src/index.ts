import colors from "colors";
import server from "./server";
import { envs } from './config/envs';

server.listen(envs.PORT, () => {
  console.log(colors.bgBlack.italic(
    `[server]: Server is running at http://localhost:${envs.PORT}`
  )
  );
});
