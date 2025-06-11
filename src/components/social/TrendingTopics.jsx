import React from "react";
import { Link } from "react-router-dom";

const TrendingTopics = ({ topics = [] }) => {
  if (!topics || topics.length === 0) {
    const defaultTopics = [
      { name: "AI", postCount: 125 },
      { name: "Technology", postCount: 98 },
      { name: "Programming", postCount: 87 },
      { name: "Web Development", postCount: 65 },
      { name: "Machine Learning", postCount: 42 },
    ];

    return (
      <div className="space-y-3">
        {defaultTopics.map((topic, index) => (
          <Link
            key={index}
            to={`/topic/${topic.name}`}
            className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-md transition-colors"
          >
            <div>
              <span className="font-medium text-gray-800">#{topic.name}</span>
              <div className="text-xs text-gray-500">
                {topic.postCount} posts
              </div>
            </div>
            <i className="fas fa-chevron-right text-gray-400 text-xs"></i>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {topics.map((topic, index) => (
        <Link
          key={index}
          to={`/topic/${topic.name}`}
          className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-md transition-colors"
        >
          <div>
            <span className="font-medium text-gray-800">#{topic.name}</span>
            <div className="text-xs text-gray-500">{topic.postCount} posts</div>
          </div>
          <i className="fas fa-chevron-right text-gray-400 text-xs"></i>
        </Link>
      ))}
    </div>
  );
};

export default TrendingTopics;
