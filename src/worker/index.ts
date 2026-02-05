import { Hono } from "hono";

interface Env { }
const app = new Hono<{ Bindings: Env }>();

export default app;
