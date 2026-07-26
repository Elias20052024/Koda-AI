import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import oauthRouter from "./oauth";
import studentsRouter from "./students";
import companiesRouter from "./companies";
import universitiesRouter from "./universities";
import internshipsRouter from "./internships";
import applicationsRouter from "./applications";
import notificationsRouter from "./notifications";
import verificationRouter from "./verification";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(oauthRouter);
router.use(studentsRouter);
router.use(companiesRouter);
router.use(universitiesRouter);
router.use(internshipsRouter);
router.use(applicationsRouter);
router.use(notificationsRouter);
router.use(verificationRouter);
router.use(dashboardRouter);

export default router;
