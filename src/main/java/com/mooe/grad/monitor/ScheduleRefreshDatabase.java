package com.mooe.grad.monitor;


import com.mooe.grad.dao.ExperimentDao;
import org.quartz.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;

@Configuration
@EnableScheduling
@Component
public class ScheduleRefreshDatabase {
    @Autowired
    private ExperimentDao experimentDao;
//    @Resource(name = "jobDetail38")
//    private JobDetail jobDetail38;

    @Resource(name = "jobTrigger38")
    private CronTrigger cronTrigger38;

//    @Resource(name = "jobDetail39")
//    private JobDetail jobDetail39;

    @Resource(name = "jobTrigger39")
    private CronTrigger cronTrigger39;

//    @Resource(name = "jobDetail40")
//    private JobDetail jobDetail40;

    @Resource(name = "jobTrigger40")
    private CronTrigger cronTrigger40;

    @Resource(name = "scheduler")
    private Scheduler scheduler;

    @Scheduled(fixedRate = 60000) // 每隔5s查库，并根据查询结果决定是否重新设置定时任务
    public void scheduleUpdateCronTrigger() throws SchedulerException {
        CronTrigger trigger38 = (CronTrigger) scheduler.getTrigger(cronTrigger38.getKey());
        String currentCron38 = trigger38.getCronExpression();// 当前Trigger38使用的
        CronTrigger trigger39 = (CronTrigger) scheduler.getTrigger(cronTrigger39.getKey());
        String currentCron39 = trigger39.getCronExpression();// 当前Trigger38使用的
        CronTrigger trigger40 = (CronTrigger) scheduler.getTrigger(cronTrigger40.getKey());
        String currentCron40 = trigger40.getCronExpression();// 当前Trigger40使用的

        String searchCron = experimentDao.getCron();// 从数据库查询出来的
        System.out.println(currentCron38);
        System.out.println(searchCron);
        if (currentCron38.equals(searchCron)) {
            // 如果当前使用的cron表达式和从数据库中查询出来的cron表达式一致，则不刷新任务
        } else {
            System.out.println("success!!!");
            // 表达式调度构建器
            CronScheduleBuilder scheduleBuilder = CronScheduleBuilder.cronSchedule(searchCron);
            //###################### 3 8 ##########################
            // 按新的cronExpression表达式重新构建trigger
            trigger38 = (CronTrigger) scheduler.getTrigger(cronTrigger38.getKey());
            trigger38 = trigger38.getTriggerBuilder().withIdentity(cronTrigger38.getKey())
                    .withSchedule(scheduleBuilder).build();
            // 按新的trigger重新设置job执行
            scheduler.rescheduleJob(cronTrigger38.getKey(), trigger38);
            currentCron38 = searchCron;
        }
        if (currentCron39.equals(searchCron)) {
            // 如果当前使用的cron表达式和从数据库中查询出来的cron表达式一致，则不刷新任务
        } else {
            System.out.println("success!!!");
            // 表达式调度构建器
            CronScheduleBuilder scheduleBuilder = CronScheduleBuilder.cronSchedule(searchCron);
            // 按新的cronExpression表达式重新构建trigger
            trigger39 = (CronTrigger) scheduler.getTrigger(cronTrigger39.getKey());
            trigger39 = trigger39.getTriggerBuilder().withIdentity(cronTrigger39.getKey())
                    .withSchedule(scheduleBuilder).build();
            // 按新的trigger重新设置job执行
            scheduler.rescheduleJob(cronTrigger39.getKey(), trigger39);
            currentCron39 = searchCron;
        }

        if (currentCron40.equals(searchCron)) {
            // 如果当前使用的cron表达式和从数据库中查询出来的cron表达式一致，则不刷新任务
        } else {
            System.out.println("success!!!");
            // 表达式调度构建器
            CronScheduleBuilder scheduleBuilder = CronScheduleBuilder.cronSchedule(searchCron);

            // 按新的cronExpression表达式重新构建trigger
            trigger40 = (CronTrigger) scheduler.getTrigger(cronTrigger40.getKey());
            trigger40 = trigger40.getTriggerBuilder().withIdentity(cronTrigger40.getKey())
                    .withSchedule(scheduleBuilder).build();
            // 按新的trigger重新设置job执行
            scheduler.rescheduleJob(cronTrigger40.getKey(), trigger40);
            currentCron40 = searchCron;
        }
    }

}
