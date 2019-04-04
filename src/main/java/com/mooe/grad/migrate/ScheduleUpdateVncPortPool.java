package com.mooe.grad.migrate;


//定期根剧各服务器端口使用情况，更新redis中的端口池，清理没有被及时删除的用户实验状态
public class ScheduleUpdateVncPortPool {

    //1.清理没有被及时删除的用户实验状态，遍历这些用户状态，然后验证端口是否在使用，未使用则删除

    //2.遍历各服务器节点vnc端口使用情况，找到正在使用的端口，并将端口池中对应项改为正在使用状态
}
