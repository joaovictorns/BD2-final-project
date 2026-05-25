import BaseController from './base.js';
import UserOrchestratorService from '@services/user';

const userService = new UserOrchestratorService();

export async function createAllUsers(req, res) {
  try {
    const result = await userService.createAllUsers();

    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}