// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= "development";

import "reflect-metadata";
import { ApplicationCommandRegistries, RegisterBehavior } from "@sapphire/framework";
import "@sapphire/plugin-editable-commands/register";
import "@sapphire/plugin-logger/register";
import "@sapphire/plugin-subcommands/register";
import { setup } from "@skyra/env-utilities";
import * as colorette from "colorette";
import { join } from "path";
import { srcDir } from "./constants";

// Set default behavior to bulk overwrite
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

// Read env var
setup({ path: join(srcDir, ".env") });

// Enable colorette
colorette.createColors({ useColor: true });
