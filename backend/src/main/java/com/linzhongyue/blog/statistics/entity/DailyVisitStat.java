package com.linzhongyue.blog.statistics.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;

@Data
@TableName("daily_visit_stat")
public class DailyVisitStat {
    @TableId(type = IdType.INPUT)
    private LocalDate statDate;
    private Long pv;
    private Long uv;
}
