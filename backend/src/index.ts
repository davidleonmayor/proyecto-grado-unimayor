import colors from "colors";
import server from "./server";
import { envs } from './config/envs';


server.listen(envs.PORT, () => {
  console.log(
    colors.green.bold("[index]🎓 Graduation project ") +
    colors.cyan("running on port ") +
    colors.yellow(envs.PORT.toString())
  );
});
