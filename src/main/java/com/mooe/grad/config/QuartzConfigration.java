package com.mooe.grad.config;


import com.mooe.grad.monitor.MigrateTask38;
import com.mooe.grad.monitor.MigrateTask39;
import com.mooe.grad.monitor.MigrateTask40;
import org.quartz.JobDetail;
import org.quartz.Trigger;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.quartz.CronTriggerFactoryBean;
import org.springframework.scheduling.quartz.MethodInvokingJobDetailFactoryBean;
import org.springframework.scheduling.quartz.SchedulerFactoryBean;

@Configuration
public class QuartzConfigration {

    //MethodInvokingJobDetailFactoryBean

    @Bean(name = "node_38_jobDetail")
    public MethodInvokingJobDetailFactoryBean node_38_detailFactoryBean(MigrateTask38 task38) {// MonitorTask为需要执行的任务
        MethodInvokingJobDetailFactoryBean jobDetail = new MethodInvokingJobDetailFactoryBean();
        /*
         *  是否并发执行
         *  例如每5s执行一次任务，但是当前任务还没有执行完，就已经过了5s了，
         *  如果此处为true，则下一个任务会执行，如果此处为false，则下一个任务会等待上一个任务执行完后，再开始执行
         */
        jobDetail.setConcurrent(false);
        jobDetail.setTargetObject(task38);
        jobDetail.setName("migration38");// 设置任务的名字
        jobDetail.setGroup("srd");// 设置任务的分组，这些属性都可以存储在数据库中，在多任务的时候使用

        /*
         * 为需要执行的实体类对应的对象
         */
        jobDetail.setTargetObject(task38);

        /*
         * sayHello为需要执行的方法
         * 通过这几个配置，告诉JobDetailFactoryBean我们需要执行定时执行ScheduleTask类中的sayHello方法
         */
        jobDetail.setTargetMethod("collectMonitorData");
        return jobDetail;
    }

    /**
     * attention:
     * Details：配置定时任务的触发器，也就是什么时候触发执行定时任务
     */
    @Bean(name = "jobTrigger38")
    public CronTriggerFactoryBean jobTrigger38(@Qualifier("node_38_jobDetail")MethodInvokingJobDetailFactoryBean node_38_jobDetail) {
        CronTriggerFactoryBean tigger = new CronTriggerFactoryBean();
        tigger.setJobDetail(node_38_jobDetail.getObject());
        tigger.setCronExpression("0 30 20 * * ?");// 初始时的cron表达式
        tigger.setName("minitor-38");// trigger的name
        return tigger;

    }

    @Bean(name = "node_39_jobDetail")
    public MethodInvokingJobDetailFactoryBean node_39_detailFactoryBean(MigrateTask39 task39) {// MonitorTask为需要执行的任务
        MethodInvokingJobDetailFactoryBean jobDetail = new MethodInvokingJobDetailFactoryBean();
        /*
         *  是否并发执行
         *  例如每5s执行一次任务，但是当前任务还没有执行完，就已经过了5s了，
         *  如果此处为true，则下一个任务会执行，如果此处为false，则下一个任务会等待上一个任务执行完后，再开始执行
         */
        jobDetail.setConcurrent(false);

        jobDetail.setName("migration39");// 设置任务的名字
        jobDetail.setGroup("srd");// 设置任务的分组，这些属性都可以存储在数据库中，在多任务的时候使用

        /*
         * 为需要执行的实体类对应的对象
         */
        jobDetail.setTargetObject(task39);

        /*
         * sayHello为需要执行的方法
         * 通过这几个配置，告诉JobDetailFactoryBean我们需要执行定时执行ScheduleTask类中的sayHello方法
         */
        jobDetail.setTargetMethod("collectMonitorData");
        return jobDetail;
    }

    @Bean(name = "jobTrigger39")
    public CronTriggerFactoryBean jobTrigger39(@Qualifier("node_39_jobDetail")MethodInvokingJobDetailFactoryBean node_39_jobDetail) {
        CronTriggerFactoryBean tigger = new CronTriggerFactoryBean();
        tigger.setJobDetail(node_39_jobDetail.getObject());
        tigger.setCronExpression("0 30 20 * * ?");// 初始时的cron表达式
        tigger.setName("monitor-39");// trigger的name
        return tigger;

    }

    @Bean(name = "node_40_jobDetail")
    public MethodInvokingJobDetailFactoryBean node_40_detailFactoryBean(MigrateTask40 task40) {// MonitorTask为需要执行的任务
        MethodInvokingJobDetailFactoryBean jobDetail = new MethodInvokingJobDetailFactoryBean();
        /*
         *  是否并发执行
         *  例如每5s执行一次任务，但是当前任务还没有执行完，就已经过了5s了，
         *  如果此处为true，则下一个任务会执行，如果此处为false，则下一个任务会等待上一个任务执行完后，再开始执行
         */
        jobDetail.setConcurrent(false);

        jobDetail.setName("migration40");// 设置任务的名字
        jobDetail.setGroup("srd");// 设置任务的分组，这些属性都可以存储在数据库中，在多任务的时候使用

        /*
         * 为需要执行的实体类对应的对象
         */
        jobDetail.setTargetObject(task40);

        /*
         * sayHello为需要执行的方法
         * 通过这几个配置，告诉JobDetailFactoryBean我们需要执行定时执行ScheduleTask类中的sayHello方法
         */
        jobDetail.setTargetMethod("collectMonitorData");
        return jobDetail;
    }

    @Bean(name = "jobTrigger40")
    public CronTriggerFactoryBean jobTrigger40(@Qualifier("node_40_jobDetail")MethodInvokingJobDetailFactoryBean node_40_jobDetail) {
        CronTriggerFactoryBean tigger = new CronTriggerFactoryBean();
        tigger.setJobDetail(node_40_jobDetail.getObject());
        tigger.setCronExpression("0 30 20 * * ?");// 初始时的cron表达式
        tigger.setName("monitor-40");// trigger的name
        return tigger;

    }

    /**
     * attention:
     * Details：定义quartz调度工厂
     */
    @Bean(name = "scheduler")
    public SchedulerFactoryBean schedulerFactory(Trigger jobTrigger38, Trigger jobTrigger39, Trigger jobTrigger40 ) {
        SchedulerFactoryBean bean = new SchedulerFactoryBean();
        // 用于quartz集群,QuartzScheduler 启动时更新己存在的Job
       // bean.setOverwriteExistingJobs(true);
        // 延时启动，应用启动1秒后
        bean.setStartupDelay(1);
        // 注册触发器
        bean.setTriggers(jobTrigger39, jobTrigger40, jobTrigger38);
        bean.setAutoStartup(true);
        return bean;
    }
}
