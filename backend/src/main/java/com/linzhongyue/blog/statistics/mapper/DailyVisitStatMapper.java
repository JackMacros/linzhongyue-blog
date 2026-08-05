package com.linzhongyue.blog.statistics.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.linzhongyue.blog.statistics.entity.DailyVisitStat;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;

public interface DailyVisitStatMapper extends BaseMapper<DailyVisitStat> {

    @Insert("""
            INSERT INTO daily_visit_stat(stat_date, pv, uv)
            VALUES(#{date}, 1, #{uvIncrement})
            ON DUPLICATE KEY UPDATE pv = pv + 1, uv = uv + #{uvIncrement}
            """)
    int recordVisit(@Param("date") LocalDate date, @Param("uvIncrement") int uvIncrement);
}
