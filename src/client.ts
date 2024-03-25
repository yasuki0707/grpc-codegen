import * as express from 'express';
import { getUser, listUsers, listStreamUsers, allUsers, updateUser, updateStreamUsers } from './clients/user';

const app: express.Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/users/:id', async (req: express.Request, res: express.Response) => {
  try {
    const response = await getUser(req.params.id);
    res.status(200).json(response.toObject());
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/users', async (req: express.Request, res: express.Response) => {
  try {
    const { limit, offset } = req.query;
    const response = await listUsers(limit ? Number(limit) : 0, offset ? Number(offset) : 0);
    res.status(200).json(response.toObject());
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/users-stream', async (req: express.Request, res: express.Response) => {
  try {
    const { limit, offset } = req.query;
    const response = await listStreamUsers(limit ? Number(limit) : 0, offset ? Number(offset) : 0);
    res.status(200).json(response.toObject());
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

app.put('/users/:id', async (req: express.Request, res: express.Response) => {
  try {
    const email = req.body.email;
    const fullName = req.body.fullName;
    const createdAt = req.body.createdAt;
    const updatedAt = req.body.updatedAt;
    const response = await updateUser(parseInt(req.params.id), email, fullName, createdAt, updatedAt);
    res.status(200).json(response.toObject());
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

app.patch('/users', async (req: express.Request, res: express.Response) => {
  try {
    const users = req.body.users;
    const response = await updateStreamUsers(users);
    res.status(200).json(response.toObject());
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

app.listen(3003, () => {
  console.log('Start on port 3003.');
});
